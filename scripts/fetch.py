#!/usr/bin/env python3
"""
Fetch data helpers for VLR.gg API-SPEC sourcing.

Usage examples:
  # fetch tiers
  python3 scripts/fetch.py --mode tiers

  # fetch a Riot match and derive game/round files
  python3 scripts/fetch.py --mode match --id M-12345

  # extract games from a saved match
  python3 scripts/fetch.py --mode games_from_match --id M-12345

  # extract rounds from a game
  python3 scripts/fetch.py --mode rounds_from_game --id M-12345:G-1

Environment:
  RIOT_API_KEY - required for Riot Match API
  HENRIK_API_KEY - optional for Henrik Dev API

Saves JSON snapshots under data/storage/{tier|tournaments|matches|games|rounds}
"""
import os
import json
import argparse
import logging
from pathlib import Path
from datetime import datetime

import requests

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "storage"
DATA_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

RIOT_KEY = "RGAPI-dba3a1d2-7747-4c1a-8abd-ba8b3e390e6d"
HENRIK_KEY = "HDEV-956ecbc7-58c7-481b-8790-1f7965af8319"

# Endpoints
RIOT_MATCH_ENDPOINT = "https://api.riotgames.com/val/match/v1/matches/{matchId}"
VALORANT_TIERS_ENDPOINT = "https://valorant-api.com/v1/competitivetiers"
# Henrik endpoints are configurable by template if needed
HENRIK_MATCH_TEMPLATE = "https://api.henrikdev.xyz/valorant/v1/matches/{matchId}"


def save_json(obj, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
    logging.info(f"Saved {path}")


def fetch_tiers():
    logging.info("Fetching competitive tiers from valorant-api.com")
    resp = requests.get(VALORANT_TIERS_ENDPOINT, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    out = DATA_DIR / "tiers.json"
    save_json({"fetched_at": datetime.utcnow().isoformat() + "Z", "source": VALORANT_TIERS_ENDPOINT, "data": data}, out)
    return data


def fetch_match_riot(match_id: str):
    if not RIOT_KEY:
        raise RuntimeError("RIOT_API_KEY not set in environment")
    url = RIOT_MATCH_ENDPOINT.format(matchId=match_id)
    headers = {"X-Riot-Token": RIOT_KEY}
    logging.info(f"Fetching Riot match {match_id}")
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code == 404:
        logging.warning("Match not found (404)")
        return None
    resp.raise_for_status()
    data = resp.json()
    out = DATA_DIR / "matches" / f"{match_id}.riot.json"
    save_json({"fetched_at": datetime.utcnow().isoformat() + "Z", "source": url, "data": data}, out)
    return data


def fetch_match_henrik(match_id: str):
    if not HENRIK_KEY:
        logging.info("HENRIK_API_KEY not set; skipping Henrik fetch")
        return None
    url = HENRIK_MATCH_TEMPLATE.format(matchId=match_id)
    headers = {"X-API-Key": HENRIK_KEY}
    logging.info(f"Fetching Henrik match {match_id}")
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code == 404:
        logging.warning("Henrik: Match not found (404)")
        return None
    resp.raise_for_status()
    data = resp.json()
    out = DATA_DIR / "matches" / f"{match_id}.henrik.json"
    save_json({"fetched_at": datetime.utcnow().isoformat() + "Z", "source": url, "data": data}, out)
    return data


def derive_games_from_match(match_id: str):
    """Reads a saved match file (riot) and extracts games/maps and players per game."""
    in_path = DATA_DIR / "matches" / f"{match_id}.riot.json"
    if not in_path.exists():
        raise FileNotFoundError(f"{in_path} not found; fetch match first")
    payload = json.loads(in_path.read_text(encoding="utf-8"))
    # Best-effort support for multiple wrapper shapes
    riot_data = payload.get("data") or payload
    # Try common Riot shapes
    if isinstance(riot_data, dict) and "info" in riot_data:
        info = riot_data["info"]
    else:
        info = riot_data

    rounds = info.get("rounds") or info.get("games") or []

    games = []
    # Group rounds by map or gameId where available
    grouped = {}
    for r in rounds:
        gid = r.get("gameId") or r.get("map") or "game_unknown"
        grouped.setdefault(gid, []).append(r)

    for gid, rlist in grouped.items():
        g = {"gameId": gid, "map": rlist[0].get("map") or rlist[0].get("mapName"), "rounds": rlist}
        games.append(g)
        out = DATA_DIR / "games" / f"{match_id}_{gid}.json"
        save_json({"derived_from": str(in_path), "extracted_at": datetime.utcnow().isoformat() + "Z", "game": g}, out)
    return games


def derive_rounds_from_game(match_id: str, game_id: str):
    in_path = DATA_DIR / "games" / f"{match_id}_{game_id}.json"
    if not in_path.exists():
        raise FileNotFoundError(f"{in_path} not found; derive games first")
    payload = json.loads(in_path.read_text(encoding="utf-8"))
    game = payload.get("game") or payload
    rounds = game.get("rounds") or []

    for r in rounds:
        round_number = r.get("roundNumber") or r.get("round") or r.get("roundNum")
        active_players = []
        players = r.get("players") or []
        for p in players:
            agent = None
            # agent may be in stats or direct
            if isinstance(p, dict):
                agent = p.get("stats", {}).get("agent") or p.get("agent")
            active_players.append({"name": p.get("name"), "team": p.get("team"), "agent": agent, "raw_stats": p.get("stats") or {}})
        out = DATA_DIR / "rounds" / f"{match_id}_{game_id}_r{round_number}.json"
        save_json({"derived_from": str(in_path), "extracted_at": datetime.utcnow().isoformat() + "Z", "roundNumber": round_number, "activePlayers": active_players, "raw": r}, out)
    return rounds


def derive_stats_snapshot_from_round(match_id: str, game_id: str, round_number: int):
    in_path = DATA_DIR / "rounds" / f"{match_id}_{game_id}_r{round_number}.json"
    if not in_path.exists():
        raise FileNotFoundError(f"{in_path} not found; derive rounds first")
    payload = json.loads(in_path.read_text(encoding="utf-8"))
    players = payload.get("activePlayers", [])
    stats_snapshot = {"timestamp": datetime.utcnow().isoformat() + "Z", "match": match_id, "game": game_id, "round": round_number, "players": []}
    for p in players:
        name = p.get("name")
        raw = p.get("raw_stats") or p.get("raw") or {}
        kills = raw.get("kills") or raw.get("kills") or 0
        deaths = raw.get("deaths") or raw.get("deaths") or 0
        assists = raw.get("assists") or raw.get("assists") or 0
        kda = (kills + assists) / (deaths if deaths > 0 else 1)
        stats_snapshot["players"].append({"name": name, "kills": kills, "deaths": deaths, "assists": assists, "kda": round(kda, 2), "raw": raw})
    out = DATA_DIR / "stats" / "rounds" / f"{match_id}_{game_id}_r{round_number}_{int(datetime.utcnow().timestamp())}.json"
    save_json(stats_snapshot, out)
    return stats_snapshot


def fetch_esports_schedule_henrik():
    """Fetch tournament schedule from Henrik Dev esports schedule endpoint and save as tournaments.json"""
    if not HENRIK_KEY:
        logging.info("HENRIK_API_KEY not set; attempting unauthenticated fetch")
    url = "https://api.henrikdev.xyz/valorant/v1/esports/schedule"
    headers = {"X-API-Key": HENRIK_KEY} if HENRIK_KEY else {}
    logging.info(f"Fetching esports schedule from Henrik: {url}")
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code == 404:
        logging.warning("Esports schedule not found (404)")
        return None
    resp.raise_for_status()
    data = resp.json()
    out = DATA_DIR / "tournaments" / "esports_schedule.henrik.json"
    save_json({"fetched_at": datetime.utcnow().isoformat() + "Z", "source": url, "data": data}, out)
    return data


def enrich_matches_from_valorant_api(discovered):
    """Query valorant-api.com /v1/matches to find match -> tournament associations and enrich discovered dict."""
    url = "https://valorant-api.com/v1/matches"
    try:
        logging.info(f"Fetching matches list from {url}")
        resp = requests.get(url, timeout=20)
        if resp.status_code != 200:
            logging.warning(f"Valorant matches endpoint returned {resp.status_code}")
            return discovered
        data = resp.json()
        payload = data.get("data") if isinstance(data, dict) and "data" in data else data
        if not isinstance(payload, list):
            logging.debug("No list payload from valorant matches endpoint")
            return discovered
        for item in payload:
            if not isinstance(item, dict):
                continue
            match_id = item.get("id") or item.get("matchId")
            # try tournament info
            tournament = item.get("competition") or item.get("tournament") or item.get("series") or {}
            tour_id = tournament.get("id") or tournament.get("tournamentId") or tournament.get("slug") or tournament.get("name")
            if not tour_id:
                # try other keys
                tour_id = item.get("competitionName") or item.get("tournamentName")
            if not match_id:
                continue
            # if we have a tour_id, ensure mapping
            if tour_id:
                t_entry = next((t for t in discovered["tournaments"] if t.get("tournamentId") == tour_id), None)
                if not t_entry:
                    t_entry = {"tournamentId": tour_id, "matches": []}
                    t_entry["name"] = str(tour_id)
                    discovered["tournaments"].append(t_entry)
                if match_id not in t_entry["matches"]:
                    t_entry["matches"].append(match_id)
            # ensure top-level matches list contains this match
            m_entry = next((m for m in discovered.get("matches", []) if m.get("matchId") == match_id), None)
            if not m_entry:
                discovered.setdefault("matches", []).append({"matchId": match_id, "games": []})
    except Exception as e:
        logging.debug(f"enrich_matches_from_valorant_api failed: {e}")
    return discovered


def discover_targets():
    """Discover tournaments, matches and games automatically from available sources and populate data/targets.json

    Fallback strategy:
      1. Henrik Dev esports schedule (preferred)
      2. Try a list of public valorant-api.com endpoints that may contain events/schedules
      3. If all fail, leave targets.json empty but writable
    """
    ROOT = Path(__file__).resolve().parents[1]
    targets_path = ROOT / "data" / "targets.json"

    discovered = {"tournaments": [], "matches": [], "notes": "Auto-discovered from Henrik Dev esports schedule and public valorant-api endpoints where possible"}

    # 1) Henrik Dev schedule
    schedule = None
    try:
        schedule = fetch_esports_schedule_henrik()
    except Exception as e:
        logging.warning(f"Failed to fetch Henrik schedule: {e}")
        schedule = None

    def parse_candidates(payload):
        """Given a payload (dict or list), return a list of candidate event items."""
        candidates = []
        if isinstance(payload, dict):
            for k in ("events", "matches", "schedule", "data", "items", "results"):
                if k in payload and isinstance(payload[k], list):
                    candidates = payload[k]
                    break
            if not candidates:
                for v in payload.values():
                    if isinstance(v, list):
                        candidates = v
                        break
        elif isinstance(payload, list):
            candidates = payload
        return candidates

    def ingest_items(candidates, discovered):
        for item in candidates:
            if not isinstance(item, dict):
                continue
            # heuristics
            tournament = item.get("tournament") or item.get("event") or item.get("competition") or {}
            tour_id = tournament.get("id") or tournament.get("tournamentId") or tournament.get("slug") or tournament.get("name")
            match_id = item.get("match_id") or item.get("id") or item.get("matchId") or item.get("eventId")
            if not tour_id:
                tour_id = item.get("competitionName") or item.get("series") or "unknown_tournament"
            # ensure tournament entry
            t_entry = next((t for t in discovered["tournaments"] if t.get("tournamentId") == tour_id), None)
            if not t_entry:
                t_entry = {"tournamentId": tour_id, "matches": []}
                t_entry["name"] = tournament.get("name") or tournament.get("title") or str(tour_id)
                discovered["tournaments"].append(t_entry)
            if match_id and match_id not in t_entry["matches"]:
                t_entry["matches"].append(match_id)
                # add to top-level matches
                m_entry = next((m for m in discovered["matches"] if m.get("matchId") == match_id), None)
                if not m_entry:
                    discovered["matches"].append({"matchId": match_id, "games": []})

    if schedule:
        payload = schedule.get("data") if isinstance(schedule, dict) and "data" in schedule else schedule
        candidates = parse_candidates(payload)
        ingest_items(candidates, discovered)

    # 2) Fallback: try known public endpoints on valorant-api.com that may list events/schedules
    if not discovered["tournaments"]:
        fallback_urls = [
            "https://valorant-api.com/v1/esports",
            "https://valorant-api.com/v1/competitions",
            "https://valorant-api.com/v1/matches",
            "https://valorant-api.com/v1/events",
            "https://valorant-api.com/v1/schedule"
        ]
        for url in fallback_urls:
            try:
                logging.info(f"Trying fallback URL: {url}")
                resp = requests.get(url, timeout=20)
                if resp.status_code != 200:
                    continue
                data = resp.json()
                payload = data.get("data") if isinstance(data, dict) and "data" in data else data
                candidates = parse_candidates(payload)
                if candidates:
                    ingest_items(candidates, discovered)
                    logging.info(f"Discovered {len(discovered['tournaments'])} tournaments from {url}")
                    break
            except Exception as e:
                logging.debug(f"Fallback {url} failed: {e}")
                continue

    # 3) If still empty, try Henrik's public 'esports' endpoint without auth variations
    if not discovered["tournaments"]:
        try:
            url = "https://api.henrikdev.xyz/valorant/v1/esports/schedule"
            logging.info(f"Final attempt (no-auth) to fetch Henrik schedule: {url}")
            resp = requests.get(url, timeout=20)
            if resp.status_code == 200:
                data = resp.json()
                payload = data.get("data") if isinstance(data, dict) and "data" in data else data
                candidates = parse_candidates(payload)
                ingest_items(candidates, discovered)
        except Exception as e:
            logging.debug(f"Final Henrik attempt failed: {e}")

    # 4) Enrich matches from valorant-api matches endpoint (populate matches if empty)
    discovered = enrich_matches_from_valorant_api(discovered)

    # Save discovered targets
    save_path = Path(__file__).resolve().parents[1] / "data" / "targets.json"
    save_json(discovered, save_path)
    logging.info(f"Discovered targets saved to {save_path}")
    return discovered


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", required=True, choices=["discover", "tiers", "match", "match_full", "games_from_match", "rounds_from_game", "round_stats"], help="Mode of fetching")
    parser.add_argument("--id", help="ID for mode (matchId or matchId:gameId or matchId:gameId:roundNumber)")
    args = parser.parse_args()

    try:
        if args.mode == "discover":
            discover_targets()

        elif args.mode == "tiers":
            fetch_tiers()

        elif args.mode == "match":
            if not args.id:
                raise SystemExit("--id MATCH_ID is required for mode 'match'")
            fetch_match_riot(args.id)
            fetch_match_henrik(args.id)

        elif args.mode == "match_full":
            if not args.id:
                raise SystemExit("--id MATCH_ID is required for mode 'match_full'")
            fetch_match_riot(args.id)
            fetch_match_henrik(args.id)
            derive_games_from_match(args.id)

        elif args.mode == "games_from_match":
            if not args.id:
                raise SystemExit("--id MATCH_ID is required for mode 'games_from_match'")
            derive_games_from_match(args.id)

        elif args.mode == "rounds_from_game":
            if not args.id or ":" not in args.id:
                raise SystemExit("--id MATCH_ID:GAME_ID required for mode 'rounds_from_game'")
            match_id, game_id = args.id.split(":", 1)
            derive_rounds_from_game(match_id, game_id)

        elif args.mode == "round_stats":
            if not args.id or args.id.count(":") < 2:
                raise SystemExit("--id MATCH_ID:GAME_ID:ROUND_NUMBER required for mode 'round_stats'")
            match_id, game_id, round_no = args.id.split(":", 2)
            derive_stats_snapshot_from_round(match_id, game_id, int(round_no))

    except Exception as e:
        logging.exception(e)
        raise


if __name__ == "__main__":
    main()

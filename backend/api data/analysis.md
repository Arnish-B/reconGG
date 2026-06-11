# ReconGG — API Data Gap & Derivation Analysis

> Source feed: `api spec.txt` (PandaScore-style Valorant export — 50 tournaments, 600 matches).
> Target shape: `window.RECON` consumed by the frontend (see `frontend` / design `data.jsx`).
>
> **Verdict:** the feed gives a solid *skeleton* (who plays whom, when, who won, logos, rosters, streams)
> but **none of the result detail** (scores, maps, rounds, standings, bracket tree). This doc lists every
> gap and — since we're OK deriving — exactly **how to synthesize each field** from the given format.

---

## 1. What the feed actually contains

### Tournament object (50 of them)
```
id, name, type(online|offline|online/offline), country, begin_at, end_at,
detailed_stats, winner_id, winner_type, teams[], expected_roster[],
slug, serie_id, serie{}, videogame{}, league_id, league{}, prizepool,
tier(s|a|b|c|d), region(WEU|ASIA|NA|SA|EEU|OCE|ME|null), has_bracket,
live_supported, matches[]
```
- `teams[]`: present on **47/50**. Fields: `id, name, acronym, location(country), slug, image_url, dark_mode_image_url, modified_at`.
- `expected_roster[]`: present on **47/50**. `{ team{}, players[] }` where player = `id, name, first_name, last_name, role, nationality, age, birthday, image_url, active, slug`.
- `serie{}`: `id, name, year, season, full_name, begin_at, end_at, slug, league_id, winner_id`.
- `league{}`: `id, name, slug, url, image_url`.
- `prizepool`: **null on 49/50**; the one value is a string `"50000 United States Dollar"`.

### Match object (600 of them)
```
id, name("Team A vs Team B" or "<Round>: Team A vs Team B"), status(not_started|finished|canceled),
winner_id, winner_type, draw, forfeit, rescheduled,
begin_at, end_at, scheduled_at, original_scheduled_at,
match_type(best_of), number_of_games(3|5), game_advantage,
tournament_id, slug, modified_at, detailed_stats,
live{supported,url,opens_at}, low_latency_feed,
streams_list[{main,language,embed_url,raw_url,official}]
```
- Status spread: `finished` 454, `not_started` 145, `canceled` 1. **No "running/live" status appears** in this dump.
- `winner_id` set on 455 matches (the finished ones).
- `games`, `opponents`, `results` arrays referenced by PandaScore schema are **all empty/absent here.**
- `live.supported` is `false` everywhere in this sample.

---

## 2. Gap table — design needs vs. feed

Legend: ✅ present · ⚠️ derivable (see §3) · ❌ not in feed (needs derivation heuristic or external source)

| Design field (`window.RECON`) | Feed coverage | How obtained |
|---|---|---|
| **Teams** |
| `team.name`, `team.tag` | ✅ | `team.name`, `team.acronym` |
| `team.logo` | ✅ (better than design) | `image_url` + `dark_mode_image_url` |
| `team.region` | ⚠️ | team has `location`(country); map to VCT region or inherit tournament `region` |
| `team.hue` / `light` | n/a (styling) | generate from logo or hash of id |
| **Tournaments** |
| `id`, `name` | ✅ | direct |
| `start`, `end` | ✅ | `begin_at`, `end_at` |
| `tier` | ⚠️ | `tier` lowercase `s/a/b/c/d` → map (see §3.1) |
| `region` | ⚠️ | `region` code → map to AMER/EMEA/PAC/CN/INTL (see §3.2) |
| `teamsCount` | ⚠️ | `teams.length` |
| `prize` | ⚠️/❌ | `prizepool` string, **mostly null** → parse or fallback |
| `status` (live/upcoming/done) | ❌ | derive from match statuses + dates (see §3.3) |
| `isVCT` | ❌ | infer from `league.name`/`serie` (see §3.4) |
| `short` (display name) | ❌ | derive from `league.name` + `serie.season` (see §3.5) |
| `location` (host city) | ❌ | only `type` + `country`; no city → fallback to country/"Online" |
| `stage` (e.g. "Playoffs · Day 6") | ❌ | synthesize from current round + date (see §3.6) |
| `live` (live match count) | ❌ | count matches currently in window (see §3.3) |
| `blurb` | ❌ | no description in feed → template or omit |
| **Matches** |
| `id`, `time` | ✅ | `id`, `scheduled_at`/`begin_at` |
| `bestOf` | ✅ | `number_of_games` (3 or 5) |
| `status` (done/live/upcoming) | ⚠️ | map feed status (see §3.7) |
| `teamA` / `teamB` | ❌ | **opponents[] empty** → parse `name` + match to `teams[]` (see §3.8) |
| `scoreA` / `scoreB` | ❌ | **not in feed at all** → only `winner_id` known (see §3.9) |
| `maps[]` (map, ra, rb, winner) | ❌ | no per-game data → cannot derive; needs games endpoint |
| `champion` flag | ⚠️ | grand-final match where `winner_id` == tournament `winner_id` |
| **Match page detail** |
| Head-to-head (avg rounds, pistols, maps won) | ❌ | no round/game stats → placeholder or external |
| Map veto / picks | ❌ | not in feed |
| **Standings / leaderboard** |
| W-L, mapW-mapL, streak | ❌ | no standings → **compute from finished matches** (see §3.10) |
| **Bracket** |
| round grouping + advancement | ❌ (structure) | `has_bracket` bool only → parse from match `name` (see §3.11) |
| **Calendar** |
| per-day matches | ✅ | bucket matches by `scheduled_at` date |
| **Bonus (feed has, design unused)** |
| Player rosters | ✅ | `expected_roster[].players[]` |
| Stream links | ✅ | `streams_list[]` |
| League / serie metadata | ✅ | `league{}`, `serie{}` |

---

## 3. Derivation recipes

### 3.1 Tier mapping
Feed `s|a|b|c|d` → design `S|A|B`. Recommend keeping the granularity instead of collapsing:
```
s→S, a→A, b→B, c→C, d→D   // extend design to show C/D, or bucket c,d → "B" if UI must stay 3-tier
```

### 3.2 Region mapping
Feed uses competitive regions; design uses VCT macro-regions:
```
NA, SA           → AMER
WEU, EEU, ME     → EMEA
ASIA, OCE        → PAC      // refine: CN if league/serie name contains "China"/"CN"
null             → INTL     // or infer from league
```
Note: this is lossy. Keep the raw `region` code too for filtering accuracy.

### 3.3 Tournament status + live count
No tournament-level status field. Derive at read time (relative to "now"):
```
matches = tournament.matches
if any match.status == "finished" && some not_started   → "live"   (in progress)
elif all match.status == "not_started" && begin_at > now → "upcoming"
elif now between begin_at and end_at                     → "live"
elif all finished/canceled || end_at < now              → "done"
live count = matches where (begin_at <= now <= begin_at+~2h) && status != finished
```
Because the dump has **no "running" status**, an in-window not_started match is the best "live" proxy.

### 3.4 `isVCT`
```
isVCT = league.name in {"VCT", "Valorant Champions Tour", "Champions", "Masters"}
        || serie.full_name matches /VCT|Champions|Masters|Kickoff/i
        || league.slug startsWith "valorant-champions" / "valorant-masters"
// VCL (Challengers) and others → isVCT = false
```

### 3.5 `short` display name
```
short = league.name + (serie.season ? " " + serie.season : "")
// e.g. league "VCL" + season "Split 2" → "VCL Split 2"
// fallback: tournament.name truncated
```

### 3.6 `stage` label
```
stage = <current round name from §3.11 of the earliest not_started match>
        + " · " + humanDate(nextMatch.scheduled_at)
// done tournaments: "Completed" + (winner ? " · Won by " + winnerTeam.name : "")
```

### 3.7 Match status mapping
```
not_started → "upcoming"
finished    → "done"
canceled    → "skip"     (design already has a "skip" status)
// "live": set when scheduled_at <= now <= scheduled_at + bestOf*~45min && not finished
```

### 3.8 Resolving `teamA` / `teamB` (opponents[] is empty)
The two teams live only in `match.name`. Algorithm:
```
1. core = name.contains(":") ? name.split(":",2)[1] : name      // strip round prefix
2. [a, b] = core.split(/ vs | vs. /i).map(trim)
3. match a,b against tournament.teams[] by name OR acronym (case-insensitive, fuzzy)
4. winner side = whichever resolved team.id === match.winner_id
```
Caveats: some names are placeholders ("TBD vs TBD") → null teams (design supports null). A few group-stage
names are acronym-only with no " vs " — fall back to leaving teams unresolved. Always prefer joining by
`team.id` via `winner_id`; only use name-parsing to get the *pair*.

### 3.9 Scores — the hard blocker
`scoreA/scoreB` and all per-map data are **not present** (`games`/`results` empty). Options:
- **Best:** pull PandaScore `GET /matches/{id}` (or `/games`) which returns `results[].score` and per-game
  detail — this dump just omitted them. Document this as the required second call.
- **Interim:** show only `winner_id` (W/L badge) and hide numeric scores; respect the design's spoiler mode.
- **Do not** fabricate scores for production; the design's `makeMaps()` synthetic generator was MVP-only.

### 3.10 Standings / leaderboard (compute, don't fetch)
No standings object. For round-robin/group stages, fold finished matches:
```
for each finished match with resolved teamA/teamB/winner:
   winner.w++ ; loser.l++
   // mapW/mapL & streak require per-map scores (§3.9) — leave 0 / "—" until games are fetched
sort by w desc, then (mw-ml) desc
```
Map win/loss columns and streaks stay unavailable until §3.9 is solved.

### 3.11 Bracket structure (parse from match names)
`has_bracket` is boolean only, but match names are **well structured** (double-elim) — group by prefix:
```
Observed prefixes: "Upper bracket quarterfinal 1..4", "Upper bracket semifinal 1..2",
"Upper bracket final", "Lower bracket round N match M", "Lower bracket quarterfinal/semifinal/final",
"Grand final", "Round 1..N" (group stage).
Round ordering key: bracket(upper<lower) → stage(R1<QF<SF<F) → index.
```
Build rounds = `groupBy(parseRoundLabel(match.name))`. Advancement links (who feeds into whom) are **not**
encoded — infer by ordering + winner_id, or render rounds as columns without connecting edges if uncertain.
Note: the design currently models **single-elim** (QF/SF/GF); the feed is mostly **double-elim** — the
bracket component needs an upper/lower extension.

---

## 4. Summary of true blockers (need external call or accept as unavailable)

| Blocker | Impact | Resolution |
|---|---|---|
| Series scores (`scoreA/scoreB`) | Hero, brackets, match list, match page | Fetch `/matches/{id}` results — not in this dump |
| Per-map breakdown (`maps[]`) | Match page core section | Fetch `/matches/{id}/games` — not in this dump |
| Head-to-head round stats | Match page H2H bars | Needs detailed game stats endpoint |
| Map veto/picks | Match page pre-game | Not offered by this feed |

Everything else in §2/§3 is **derivable from the given format** with the recipes above.

---

## 5. Recommended next step
Build a transform layer `feed → window.RECON` implementing §3.1–§3.11, with scores/maps/H2H left as
explicit `null`/empty until the per-match detail endpoint is wired in. Keep raw `region`/`tier` codes
alongside the mapped values so filtering stays accurate. See `API-SPEC.md` for the target contract.

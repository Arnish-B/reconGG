Cron / Runner README

Purpose: run scheduled jobs to populate source-of-truth JSON files

Jobs and frequencies:
- Per round: every 30s (use scripts/round_runner.sh under systemd or screen/tmux)
- Per game: every 10 minutes (cron: */10 * * * *)
- Per match: every hour (cron: 0 * * * *)
- Per tournament / tournament list: daily at 03:00 (cron: 0 3 * * *)

How to configure:
1. Set environment variables:
   - RIOT_API_KEY (required for Riot match calls)
   - HENRIK_API_KEY (optional)
2. Edit data/targets.json with tournament/match/game IDs to track.
3. Install dependencies: pip install requests
4. Add cron entries from cron/cronjobs.txt and run scripts/round_runner.sh for per-round polling (or convert to systemd timer).

Data output locations:
- data/storage/tiers.json
- data/storage/matches/{matchId}.riot.json
- data/storage/matches/{matchId}.henrik.json
- data/storage/games/{matchId}_{gameId}.json
- data/storage/rounds/{matchId}_{gameId}_r{round}.json
- data/storage/stats/rounds/{matchId}_{gameId}_r{round}_{ts}.json

Notes:
- The scripts are best-effort and defensive about different JSON shapes returned by Riot wrappers. Validate with a sample match.
- Avoid committing API keys; use environment variables or a secrets manager.

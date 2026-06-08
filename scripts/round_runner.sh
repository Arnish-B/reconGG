#!/usr/bin/env bash
# Simple runner for per-round snapshots (every 30s). Run under a supervisor (systemd, tmux, screen).
# Usage: ./scripts/round_runner.sh MATCH_ID GAME_ID ROUND_NUMBER

MATCH_ID="$1"
GAME_ID="$2"
ROUND_NUMBER="$3"

if [ -z "$MATCH_ID" ] || [ -z "$GAME_ID" ] || [ -z "$ROUND_NUMBER" ]; then
  echo "Usage: $0 MATCH_ID GAME_ID ROUND_NUMBER"
  exit 2
fi

while true; do
  /usr/bin/env python3 "$(dirname "$0")/fetch.py" --mode round_stats --id "${MATCH_ID}:${GAME_ID}:${ROUND_NUMBER}"
  sleep 30
done

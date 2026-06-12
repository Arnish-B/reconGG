#!/usr/bin/env bash
# reconGG post-pull reminder (PostToolUse on Bash).
# Reads the hook JSON on stdin. If the command was a `git pull`, remind Claude to
# refresh the graph and re-run fallow. Otherwise, no output (silent pass-through).
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"

case "$cmd" in
  *"git pull"*)
    jq -n '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:"reconGG workflow (CLAUDE.md Segment 4.2): a git pull just completed. Run the graphify skill to refresh the local knowledge graph, then run fallow on any merged TS/JS source."}}'
    ;;
  *) exit 0 ;;
esac

#!/usr/bin/env bash
# reconGG pre-push / pre-commit gate (PreToolUse on Bash).
# Reads the hook JSON on stdin, inspects the Bash command, and:
#   - git push:   hard-block (deny) if the graphify knowledge graph is missing or
#                 stale; otherwise inject the required-review reminder.
#   - git commit: inject the review reminder only (never blocks).
#   - anything else: no output (silent pass-through).
set -euo pipefail

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""')"

reminder='reconGG workflow (CLAUDE.md Segments 3-4): before this git action you MUST have (1) launched a separate expert review agent on the diff, (2) run the impeccable skill on any UI/frontend changes, and (3) run fallow on changed TS/JS.'

emit_context() { jq -n --arg c "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",additionalContext:$c}}'; }
emit_deny()    { jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'; }
mtime()        { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0; }

case "$cmd" in
  *"git push"*) mode="push" ;;
  *"git commit"*) mode="commit" ;;
  *) exit 0 ;;
esac

if [ "$mode" = "commit" ]; then
  emit_context "$reminder"
  exit 0
fi

# --- push: graphify freshness gate ---
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
report="$repo_root/graphify-out/GRAPH_REPORT.md"

if [ ! -f "$report" ]; then
  emit_deny "graphify gate FAILED: graphify-out/GRAPH_REPORT.md is missing. Run the graphify skill to build the knowledge graph before pushing. $reminder"
  exit 0
fi

newest_src=0
while IFS= read -r f; do
  [ -f "$repo_root/$f" ] || continue
  m="$(mtime "$repo_root/$f")"
  [ "$m" -gt "$newest_src" ] && newest_src="$m"
done < <(git -C "$repo_root" ls-files '*.ts' '*.tsx' '*.js' '*.jsx')

report_m="$(mtime "$report")"

if [ "$newest_src" -gt "$report_m" ]; then
  emit_deny "graphify gate FAILED: the knowledge graph is stale (TS/JS source is newer than graphify-out/GRAPH_REPORT.md). Re-run the graphify skill before pushing. $reminder"
  exit 0
fi

emit_context "graphify gate OK (graph is current). $reminder"
exit 0

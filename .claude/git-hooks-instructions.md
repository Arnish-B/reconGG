# Git Push/Pull Instructions for Claude

**MANDATORY**: Claude MUST follow these instructions every time a git `push` or `pull` operation is performed in this repository. These rules override default behavior and apply to every relevant action without exception.

## Scope

This file applies whenever Claude is about to run, or has just completed, any of the following:

- `git push` (any variant, including `git push -u`, `git push --force`, branch pushes, tag pushes)
- `git pull` (any variant, including `git pull --rebase`, `git pull origin <branch>`)
- Equivalent operations via `gh` (e.g. `gh pr create` that triggers a push, `gh repo sync`)

## Required Workflow

### Before a `git push`

1. **Run graphify** to rebuild the project knowledge graph against the current working tree so the graph reflects exactly what is being pushed.
   - Invoke the `graphify` skill (do not skip, even for small changes).
   - If graphify fails, do NOT push. Surface the error to the user and stop.
2. **Run fallow** on the changed TypeScript/JavaScript files per the standing [Use Fallow during development](../memory/feedback_use-fallow.md) memory.
   - If fallow reports dead code, duplication, complexity hotspots, circular deps, or architecture violations introduced by the diff, surface them to the user before pushing.
3. Only after graphify (and fallow, where applicable) complete cleanly, proceed with the `git push`.
4. Commit the updated `graphify-out/` artifacts only if the user has explicitly opted in. Otherwise, leave them untracked (the repo's `.gitignore` policy governs this).

### After a `git pull`

1. **Run graphify** immediately after the pull completes so the local knowledge graph incorporates incoming changes.
   - This ensures subsequent `graphify` queries, dependency tracing, and architecture answers reflect the freshly pulled state.
2. If the pull modified TypeScript/JavaScript source, run **fallow** on the merged result to flag any issues introduced by the merge.
3. Report a short summary to the user:
   - What changed (file count / high-level areas).
   - Whether graphify succeeded.
   - Any fallow findings worth attention.

## Skill Coordination

This repository has additional skills that may also need to run depending on what changed in the push/pull. Use judgment, but at minimum consider:

- **frontend-component** — if files under `frontend/` changed, consider whether components need review.
- **backend-lld** — if `backend/` or `API-SPEC.md` changed, re-check contracts.
- **impeccable** / **ui-ux-pro-max** — if UI surfaces changed, flag whether a design pass is warranted.
- **fallow** — always run on TS/JS diffs (mandatory per memory).
- **graphify** — always run on push and pull (mandatory per this file).

Only `graphify` and `fallow` are *mandatory* on every push/pull. The others are advisory and run on relevance.

## Failure Handling

- If `graphify` fails on a **pre-push** run: block the push, report the error, and ask the user how to proceed. Do not bypass.
- If `graphify` fails on a **post-pull** run: the pull has already completed — report the failure clearly so the user knows the local graph is stale.
- Never use `--no-verify` or otherwise skip these steps unless the user explicitly instructs you to for a specific operation.

## Adherence

Treat this file as a hard rule. Re-read it whenever a push or pull is requested. If a conflict arises between this file and a one-off user instruction, follow the user's explicit instruction for that operation only and note the deviation.

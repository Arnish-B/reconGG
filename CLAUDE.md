# reconGG — Project Instructions for Claude

These instructions are **mandatory** and override default behavior. They define the full
lifecycle for working in this repository: how the project and its skills were set up, how
to develop frontend and backend code, how to review changes, and how to perform git
actions. Re-read the relevant segment before acting in that phase. When in doubt, stop and
ask rather than guessing.

reconGG is a VALORANT esports (vlr.gg) reconnaissance app: a **Next.js + TypeScript +
Tailwind** frontend in `frontend/` and a JSON API backend (`backend/`, documented in
`API-SPEC.md`) consumed via `X-API-Key` auth.

---

## 1. Creation of the project

This project is configured with six skills under `.claude/skills/`. Each skill exists for a
specific phase of work. Before invoking any skill, confirm it is present and read its
`SKILL.md` frontmatter so you apply its current rules (skills may have been updated since
this file was written).

The skills, in the order they were added and the role each plays:

1. **`fallow`** — Deterministic static analysis for TypeScript/JavaScript (dead code,
   duplication, complexity hotspots, circular dependencies, architecture violations).
   - Location: `.claude/skills/fallow/SKILL.md`.
   - Prerequisite: installed in the frontend workspace via `cd frontend && npm install --save-dev fallow`.
   - Used as a **hard gate** before any TS/JS work is considered done (see Segment 3).

2. **`ui-ux-pro-max`** — UI/UX design intelligence: 50+ styles, 161 color palettes, 57 font
   pairings, 161 product types, 99 UX guidelines, 25 chart types across 10 stacks.
   - Location: `.claude/skills/ui-ux-pro-max/SKILL.md`.
   - The **design-decision authority** for any visual, layout, color, typography, spacing,
     interaction, accessibility, or chart work (see Segment 2).

3. **`impeccable`** — Production-grade frontend design/iteration engine (craft, audit,
   polish, animate, harden, etc.) with live browser iteration.
   - Location: `.claude/skills/impeccable/SKILL.md`.
   - Run `node .claude/skills/impeccable/scripts/context.mjs` once per session before use.
   - Used for the **final design/quality pass** on UI before pushing (see Segment 3).

4. **`graphify`** — Builds a queryable code knowledge graph (`graphify-out/graph.html`,
   `GRAPH_REPORT.md`, `graph.json`) for architecture and dependency questions.
   - Location: `.claude/skills/graphify/SKILL.md`.
   - Prerequisites: Python 3.10+, `uv tool install graphifyy`, then `graphify install` and
     `graphify claude install`.
   - Used to **understand the codebase** and as a **mandatory git gate** (see Segment 4).

5. **`frontend-component`** (the project-specific "frontend" skill) — Builds React/Next.js
   UI the way this repo expects: TypeScript, Tailwind, shadcn/ui primitives, Aceternity for
   premium/animated sections, mobile-first + dark mode.
   - Location: `.claude/skills/frontend-component/SKILL.md`.
   - Source of truth it points to: `frontend/.docs/FRONTEND_GUIDELINES.md`.
   - **Mandatory** for all frontend component work (see Segment 2).

6. **`backend-lld`** (the project-specific "backend" skill) — Produces an
   implementation-ready low-level design for any backend feature/endpoint, anchored to
   `API-SPEC.md`.
   - Location: `.claude/skills/backend-lld/SKILL.md`.
   - **Mandatory** for all backend work (see Segment 2).

If any skill listed above is missing or its prerequisites are not installed, stop and tell
the user before proceeding — do not silently skip a mandated skill.

---

## 2. Development of the project

Apply the right skill(s) for the surface you are touching. Never write feature code in a
mandated area without first loading that area's skill rules.

### 2.1 Frontend changes (any file under `frontend/`)

For **any and all** frontend changes you MUST adhere to the rules in both the
`ui-ux-pro-max` skill and the project-specific `frontend-component` skill. Step by step:

1. **Load the rules first.** Read `.claude/skills/frontend-component/SKILL.md` and
   `frontend/.docs/FRONTEND_GUIDELINES.md` (its declared source of truth). Invoke the
   `ui-ux-pro-max` skill for any visual/UX/structural decision (style, color, typography,
   spacing, layout, interaction states, accessibility, charts).
2. **Reuse before creating.** Check `frontend/src/components/ui/` for an existing shadcn
   primitive before adding a new one (`npx shadcn@latest add <name>`). Place files
   correctly: `ui/` (primitives), `features/` (composite), `layouts/` (wrappers),
   `common/` (shared utilities).
3. **Verify framework APIs.** This Next.js version may differ from training data — check
   `node_modules/next/dist/docs/` for any API you are unsure about and heed deprecation
   notices.
4. **Follow the component checklist.** Explicit TypeScript prop interfaces (no `any`;
   export reusable prop types), `@/` import alias, mobile-first responsive, dark-mode
   aware. Honor every checklist item in `frontend-component/SKILL.md`.
5. **Apply `ui-ux-pro-max` recommendations** for color systems, font pairing, spacing
   scale, hierarchy, and accessibility — do not improvise design values when the skill
   provides them.
6. **Run `fallow`** on the changed TS/JS before considering the task done (see Segment 3).

### 2.2 Backend changes (any file under `backend/` or `API-SPEC.md`)

For **any and all** backend changes you MUST adhere to the rules in the project-specific
`backend-lld` skill. Step by step:

1. **Read `API-SPEC.md` first.** Reuse the shared types (`Region`, `Tier`, `MatchFormat`,
   `BracketStage`, `WinType`, `Platform`) instead of inventing new enums. Base URL,
   JSON shapes, and `X-API-Key` auth conventions defined there are authoritative.
2. **Produce the LLD before writing code.** Follow `backend-lld/SKILL.md`: state the goal
   in one sentence; define the contract (HTTP method, path, query/body params with required
   flags, exact JSON response + status codes); define the data model (entities, field
   types, relationships, which existing shapes it extends); define validation, auth, and
   the error response for each failure mode; enumerate edge cases (pagination, empty
   results, live vs finished, rate limits); note trade-offs.
3. **Implement consistently** with the contract and shared types from the LLD — keep new
   work aligned with existing tournament/match/team/player shapes.
4. **Run `fallow`** on any changed TS/JS before considering the task done (see Segment 3).

> Note: the brief that requested this file said "backend-lld … for any and all frontend
> changes" — that was a typo. `backend-lld` governs **backend** changes; `ui-ux-pro-max` +
> `frontend-component` govern **frontend** changes.

---

## 3. Review

Every change must pass review **before** any commit or push. This happens automatically as
part of the git workflow — do not wait to be asked. Execute these steps in order and block
the commit/push if any step fails.

### 3.1 Expert review agent (always, before any commit/push)

1. Before staging a commit or initiating a push, **launch a separate expert reviewer
   agent** using the `Agent` tool with `subagent_type` set to a code-review specialist
   (e.g. the code-review / security-review agent), scoped to the current diff
   (`git diff` for unstaged + staged, or `git diff <base>...HEAD` for a branch).
2. The reviewer agent runs in isolation from your working context so it can give an
   independent read. Brief it with: what changed, why, and the files/line ranges to focus
   on. Ask for correctness bugs, security issues, and reuse/simplification opportunities.
3. **Surface every finding to the user.** Fix correctness and security findings before
   proceeding. Do not push over an unresolved high-severity finding without explicit user
   sign-off.

### 3.2 `impeccable` + `fallow` design/quality gate (before pushing to git)

1. **Run `fallow`** on all changed TypeScript/JavaScript (mandatory per the standing
   [Use Fallow during development](../memory/feedback_use-fallow.md) memory). If it reports
   dead code, duplication, complexity hotspots, circular deps, or architecture violations
   introduced by the diff, surface them and resolve or get sign-off before pushing.
2. **Run `impeccable`** whenever UI surfaces changed: execute
   `node .claude/skills/impeccable/scripts/context.mjs` once, then perform the relevant
   pass (e.g. `audit`/`polish`) per its reference docs. Confirm the change is responsive,
   on-brand, accessible, and bug-free in a real browser where the skill supports it.
3. Only after the expert review (3.1) and the `impeccable` + `fallow` gate (3.2) complete
   cleanly may you proceed to the git action in Segment 4.

---

## 4. Git actions

The full git push/pull workflow is defined in
[.claude/git-hooks-instructions.md](.claude/git-hooks-instructions.md). Those rules are
mandatory; **re-read that file whenever a push or pull is requested.** Summary of the
required sequence:

### 4.1 Before any `git commit` or `git push`

1. Complete **Segment 3** in full (expert review agent, then `impeccable` + `fallow`).
2. **Run the `graphify` skill** to rebuild the knowledge graph against the current working
   tree so the graph reflects exactly what is being pushed. **If `graphify` fails, do NOT
   push** — surface the error and stop.
3. **Run `fallow`** on the changed TS/JS diff (if not already clean from Segment 3).
4. Stage specific files by name (never blanket `git add -A`/`.`). Do not commit secrets
   (`.env`, credentials) or large binaries. Only commit `graphify-out/` artifacts if the
   user has explicitly opted in; otherwise leave them untracked.
5. Create the commit (never `--no-verify`, never skip hooks, never amend published
   commits unless the user explicitly asks). Only commit when the user has asked you to.
6. Push only when explicitly requested. Never force-push to `master` without explicit
   confirmation.

### 4.2 After any `git pull`

1. **Run the `graphify` skill** immediately so the local knowledge graph incorporates the
   incoming changes.
2. If the pull modified TS/JS source, **run `fallow`** on the merged result to flag issues
   introduced by the merge.
3. Report a short summary: what changed (file count / high-level areas), whether `graphify`
   succeeded, and any `fallow` findings worth attention.

### 4.3 Failure handling

- `graphify` fails on **pre-push**: block the push, report the error, ask how to proceed.
- `graphify` fails on **post-pull**: the pull already completed — clearly report that the
  local graph is now stale.
- Never bypass these gates with `--no-verify` or equivalent unless the user explicitly
  instructs you to for one specific operation, and note the deviation when you do.

---

## Skill quick reference

| Skill | Phase | When it is mandatory |
|-------|-------|----------------------|
| `frontend-component` | Development | Every `frontend/` change |
| `ui-ux-pro-max` | Development | Every frontend visual/UX decision |
| `backend-lld` | Development | Every `backend/` or `API-SPEC.md` change |
| (expert review agent) | Review | Before every commit/push |
| `impeccable` | Review | Before push when UI changed |
| `fallow` | Review + Git | Before any TS/JS task is done; before push |
| `graphify` | Git | Before every push; after every pull |

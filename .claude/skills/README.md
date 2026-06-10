# reconGG Skills

This folder holds **Claude Code skills** for the reconGG project — reusable, invocable
capabilities that Claude Code auto-discovers and loads on demand. Each skill teaches the
agent how to do one kind of task the *right* way for this repo, from frontend components to
backend low-level design (LLD).

## How skills work

- Each skill lives in its own folder: `.claude/skills/<skill-name>/SKILL.md`.
- The `SKILL.md` starts with YAML frontmatter (`name`, `description`). The `description`
  is what Claude uses to decide *when* to pull the skill in, so make it specific.
- A skill can ship supporting files (templates, scripts, examples) alongside `SKILL.md`;
  reference them by relative path from inside the skill.
- Invoke explicitly with `/<skill-name>`, or let Claude trigger it automatically when a
  request matches the description.

## Current skills

| Skill | Use it when… |
|-------|--------------|
| [`frontend-component`](frontend-component/SKILL.md) | Building a new React/Next.js UI component (shadcn + Aceternity + Tailwind). |
| [`backend-lld`](backend-lld/SKILL.md) | Designing a backend feature/endpoint: data model, contracts, error handling. |

## Adding a new skill

1. Create `.claude/skills/<your-skill>/SKILL.md`.
2. Add frontmatter:
   ```yaml
   ---
   name: your-skill
   description: One line on exactly when this skill should fire.
   ---
   ```
3. Write clear, step-by-step instructions. Prefer checklists and concrete code over prose.
4. Add a row to the table above.

Keep skills **narrow and composable** — one job each. A skill that does everything fires for
nothing.

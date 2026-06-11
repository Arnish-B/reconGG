---
name: frontend-component
description: Use when creating or refactoring a React/Next.js UI component in frontend/ — building shadcn/Aceternity components, layouts, or feature sections with Tailwind and TypeScript.
---
# Frontend Component

Build UI for the reconGG Next.js app the way this repo expects: TypeScript, Tailwind,
shadcn/ui primitives, Aceternity for premium/animated sections, mobile-first + dark mode.

## Before you write anything

1. Read `frontend/.docs/FRONTEND_GUIDELINES.md` — it is the source of truth.
2. This Next.js may differ from training data; check `node_modules/next/dist/docs/` for any
   API you're unsure about. Heed deprecation notices.
3. Check `frontend/src/components/ui/` for an existing shadcn primitive before adding one.

## Where things go

```
frontend/src/components/
├── ui/         # shadcn/ui primitives — add via `npx shadcn@latest add <name>`
├── features/   # feature-specific composite components
├── layouts/    # page/section layout wrappers
└── common/     # small shared utility components
```

## Checklist

- [ ] **TypeScript**: explicit prop interface; no `any`. Export the prop type if reusable.
- [ ] **Imports**: always use the `@/` alias (e.g. `@/components/ui/button`).
- [ ] **Styling**: Tailwind utility classes only; no raw CSS without a documented reason.
- [ ] **Responsive**: mobile-first, layer `sm: md: lg: xl:` breakpoints.
- [ ] **Dark mode**: include `dark:` variants for colors/backgrounds/borders.
- [ ] **shadcn first**: compose from `ui/` primitives; only reach for Aceternity for
  animated/hero/premium sections.
- [ ] **Accessibility**: semantic elements, `aria-*` where needed, keyboard-focusable.
- [ ] **Server vs client**: only add `"use client"` when the component needs hooks,
  state, or browser APIs.
- [ ] Run `npm run lint` (from `frontend/`) before considering it done.

## Skeleton

```tsx
// frontend/src/components/features/match-card.tsx
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MatchCardProps {
  matchId: string;
  className?: string;
}

export function MatchCard({ matchId, className }: MatchCardProps) {
  return (
    <Card className={cn("p-4 bg-card dark:bg-card/80", className)}>
      {/* content */}
    </Card>
  );
}
```

## Domain note

reconGG is a VALORANT esports analytics UI (VLR.gg-style). Components often render
tournaments, matches, teams, and players — see `API-SPEC.md` for the shapes these
components consume, and pair this skill with `backend-lld` when the data contract is new.

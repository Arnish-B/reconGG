---
name: backend-lld
description: Use when designing a backend feature or API endpoint for reconGG — defining data models, request/response contracts, validation, error handling, and how it maps to API-SPEC.md.
---

# Backend Low-Level Design (LLD)

Produce a tight, implementation-ready design for a backend feature before writing code.
The reconGG API is documented in `API-SPEC.md` (base `https://api.vlr.gg/v1`, JSON,
`X-API-Key` auth). Keep new work consistent with the types and conventions defined there.

## Steps

1. **Read `API-SPEC.md`** — reuse the shared types (`Region`, `Tier`, `MatchFormat`,
   `BracketStage`, `WinType`, `Platform`) instead of inventing new enums.
2. **State the goal** in one sentence: what does this endpoint/feature do and for whom.
3. **Contract**: define the HTTP method, path, query/body params (with required flags),
   and the exact JSON response shape including status codes.
4. **Data model**: entities, fields + types, relationships, and which existing shapes
   (tournament, match, team, player) it extends or references.
5. **Validation & errors**: input validation rules, auth check, and the error responses
   (status + body) for each failure mode.
6. **Edge cases**: pagination, empty results, live vs finished state, rate limits.
7. **Trade-offs**: note the chosen approach and what you rejected, briefly.

## Output template

```md
### <Feature> — LLD

**Goal:** …

**Endpoint:** `GET /…`

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| …     | …    | …        | …     |

**Response 200:**
```json
{ }
```

**Errors:**
| Status | When | Body |
|--------|------|------|
| 400 | invalid param | `{ "error": "…" }` |
| 401 | missing/invalid X-API-Key | `{ "error": "…" }` |
| 404 | not found | `{ "error": "…" }` |

**Data model:** …

**Edge cases:** …

**Trade-offs:** …
```

## Rules

- Match the casing/shape conventions already in `API-SPEC.md` (e.g. `matchId`, ISO-8601
  dates, `X-API-Key` header).
- Prefer extending existing types over duplicating them.
- Keep the design reviewable: tables and JSON over prose. No code until the contract is agreed.

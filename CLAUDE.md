# Claude Instructions — NOBOT

You are helping build NOBOT, a game + knowledge sharing + community platform where users prove they are human by detecting AI-generated content. Read and follow all rules below on every suggestion you make.

Reference prototype is in `docs/prototype/` — use it to understand intended UI and behaviour, not as source code to copy verbatim.

---

## Stack

- Frontend: React, Vite, TypeScript, TanStack Router, Axios, Tailwind CSS (`app/web`)
- Backend: Express, TypeScript, Prisma, SQLite, Zod (`app/api`)
- Auth: username + password, JWT in httpOnly cookie (`nobot_token`)

---

## Project layout

```
app/
  api/                  — Express backend
    prisma/             — schema.prisma, seed.ts
    src/
      features/         — auth, game, contribute, discussion, profile
      common/           — middleware, utils, lib
  web/                  — React frontend
    src/
      features/         — auth, game, contribute, discussion, profile
      common/           — components, store, lib
docs/
  prototype/            — reference HTML prototype (read-only)
  features/             — per-dev todo checklists
```

Each dev owns one feature folder end-to-end (API + web). See `docs/features/*.todo.md`.

---

## Naming conventions

- Files: camelCase (`gameController.ts`, `ThreadCard.tsx`)
- Variables and functions: camelCase (`getThreadById`, `useDiscussion`)
- React components: PascalCase (`PostCard`, `ThreadCard`)
- Zod schemas: PascalCase with Dto suffix (`CreateThreadDto`)
- TypeScript types inferred from Zod: PascalCase with Input suffix (`CreateThreadInput`)
- Constants: UPPER_SNAKE_CASE (`MAX_TELLS_PER_POST`)

---

## Git rules

- Never commit directly to main
- Always work on a feature branch: `feature/<your-name>-<feature>`
- Commit messages must follow conventional commits:
  ```
  feat(scope): subject
  fix(scope): subject
  chore(scope): subject
  ```
- Subject must be lowercase, no period at end, max 100 chars
- One logical change per commit — do not batch unrelated changes

---

## TypeScript rules

- Always use strict TypeScript — no implicit any
- Always type function parameters and return values on service functions
- Use Zod infer for DTO types in the backend
- Prefix unused variables with underscore (`_req`)
- Never use `as any` — use proper types or `unknown`
- Non-null assertion (`!`) is allowed only on `req.user` after `requireAuth` middleware

---

## Things Claude must never do

- Never add a new feature not described in `docs/features/*.todo.md` without checking first
- Never add image upload infrastructure — `imageUrl` on Post is a plain string URL for now
- Never add a karma or points system — it is not in the DB schema
- Never add pagination — all lists are fetched in full for now
- Never use React Query — data fetching uses plain axios hooks with useState + useEffect
- Never use shadcn or any component library — build components with plain Tailwind
- Never hardcode hex colours in JSX className — use Tailwind classes only

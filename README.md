# NOBOT

A knowledge sharing game + community platform where users prove they are human by detecting AI-generated content.

> **Dead Internet Theory** — the idea that the modern internet is no longer mostly made by humans. Bots, AI-generated content, and automated engagement have quietly replaced authentic human activity. Most posts, comments, and reactions you see may not come from real people at all.
>
> NOBOT is built around that premise. To join the community, you must first pass a verification round — read posts, spot the bots, spare the humans. Only verified humans get in.

---

## Stack

- **Frontend** — React, TypeScript, Vite, TanStack Router, Axios, Tailwind CSS
- **Backend** — Express, TypeScript, Zod, Prisma, SQLite
- **Auth** — Username + password, JWT in httpOnly cookie

---

## Project structure

```
app/
  api/        Express backend
  web/        React frontend
docs/
  prototype/  Reference HTML prototype
  features/   Per-dev todo checklists
```

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp app/api/.env.example app/api/.env
cp app/web/.env.example app/web/.env
```

### 3. Set up the database

```bash
npm run db:migrate
npm run db:seed
```

### 4. Start development servers

```bash
npm run dev
```

API runs on `http://localhost:3000` — Web runs on `http://localhost:5173`

---

## Dev ownership

| Dev | Feature               | Todo                               |
| --- | --------------------- | ---------------------------------- |
| 1   | Game + Auth           | `docs/features/game.todo.md`       |
| 2   | Contribute            | `docs/features/contribute.todo.md` |
| 3   | Discussion            | `docs/features/discussion.todo.md` |
| 4   | Profile + Leaderboard | `docs/features/profile.todo.md`    |

---

## Useful commands

| Command              | Description              |
| -------------------- | ------------------------ |
| `npm run dev`        | Start both api and web   |
| `npm run dev:api`    | Start api only           |
| `npm run dev:web`    | Start web only           |
| `npm run typecheck`  | Type-check both packages |
| `npm run db:migrate` | Run Prisma migrations    |
| `npm run db:seed`    | Seed the database        |
| `npm run db:studio`  | Open Prisma Studio       |

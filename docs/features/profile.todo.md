# Dev 4 — Profile & Leaderboard

Reference prototype: `docs/prototype/Profile.html`, `docs/prototype/Leaderboard.html`

---

## API

### Profile (`app/api/src/features/profile/`)
Files are stubbed. Implementation is complete — no changes needed.

Routes:
- `GET /api/profile/leaderboard` — all users ranked by best score, includes accuracy and streak
- `GET /api/profile/:id`         — single user profile with last 10 games

#### Note on route order
`/leaderboard` must be registered **before** `/:id` in `profile.routes.ts` or Express will match "leaderboard" as an id param. This is already correct in the scaffold.

#### Leaderboard response shape (from `profile.service.ts`)
```ts
{
  id: number
  username: string
  isVerified: boolean
  score: number      // best single-game score
  accuracy: number   // average accuracy across all games
  streak: number     // best streak across all games
}[]
```

#### Profile response shape
```ts
{
  id: number
  username: string
  isVerified: boolean
  createdAt: string
  games: Game[]      // last 10 games, ordered by createdAt desc
}
```

Derive these values client-side from `games[]`:
- Status badge: last game accuracy >= 80 → SURVIVOR, >= 60 → FLAGGED, else ASSIMILATED
- Total sessions count: `games.length`
- Best score: `Math.max(...games.map(g => g.score))`

---

## Web

### Profile hook (`app/web/src/features/profile/hooks/useProfile.ts`)
Already implemented. Exposes `getProfile`, `getLeaderboard`.

### Profile page (`app/web/src/features/profile/pages/ProfilePage.tsx`)

#### Hero section
- Large avatar initial (first char of username, uppercased)
- Username as handle (`@username`)
- Joined date (formatted from `createdAt`)
- Status badge: SURVIVOR / FLAGGED / ASSIMILATED (derived from last game accuracy)
- `◉ VERIFIED HUMAN` badge if `isVerified === true`

#### Stat strip (2-column grid)
- Sessions: total game count
- Best score: highest score across all games

#### Audit history table
Columns: Mode, Verdict, Score, Accuracy, When

Each row maps a game:
- Mode: always `PURGE`
- Verdict: derive from accuracy (>=80 SURVIVOR, >=60 FLAGGED, else ASSIMILATED)
- Score: `game.score`
- Accuracy: `game.accuracy%`
- When: formatted `game.createdAt`

Fetch the logged-in user's profile using `useAuthStore().user?.id`.

#### Auth guard
Page requires login. If no user in store, redirect to `/login`.

---

### Leaderboard page (`app/web/src/features/profile/pages/LeaderboardPage.tsx`)

#### Podium (top 3)
Render rank 2 / 1 / 3 in that visual order (centre is tallest). Each pod shows: rank label, avatar initial, username, score, accuracy%.

#### Rankings table
Columns: Rank, Member (avatar + username + audits/streak), Score, Accuracy (with mini progress bar), Status badge

- Toggle between Accuracy ranking (sort by score) and Karma ranking — Karma can be stubbed as `score / 10` for now since there is no karma field yet
- Highlight the logged-in user's row

#### Network strip (top of page, static for now)
- Registered Members: total user count (add `GET /api/profile/stats` returning `{ userCount }` if time permits, otherwise hardcode)
- Active This Week: stub
- Human Content: stub

---

## Checklist

### API
- [ ] `GET /api/profile/leaderboard` returns users sorted by best score
- [ ] `GET /api/profile/:id` returns user with last 10 games
- [ ] `/leaderboard` route resolves before `/:id` (already correct)

### Web — Profile
- [ ] ProfilePage fetches current user's profile on mount
- [ ] Hero shows avatar, username, joined date, status badge, verified badge
- [ ] Stat strip shows sessions and best score
- [ ] Audit history table renders all games
- [ ] Page redirects to `/login` if not authenticated

### Web — Leaderboard
- [ ] LeaderboardPage fetches leaderboard on mount
- [ ] Podium renders top 3 in correct visual order
- [ ] Rankings table renders all rows
- [ ] Logged-in user's row is highlighted
- [ ] Sort toggle (Accuracy / Karma) works client-side

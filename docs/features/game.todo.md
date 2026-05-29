# Dev 1 — Game + Auth

Reference prototype: `prototype/Game.html`, `prototype/game/engine.js`, `prototype/game/world.js`, `prototype/game/data.js`

---

## API

### Auth (`app/api/src/features/auth/`)
Files are stubbed. Implementation is complete — no changes needed.

Routes:
- `POST /api/auth/register` — validate RegisterDto, hash password, create user
- `POST /api/auth/login` — verify credentials, set `nobot_token` httpOnly cookie, return user
- `POST /api/auth/logout` — clear cookie
- `GET  /api/auth/me` — return req.user (requires auth)

### Game (`app/api/src/features/game/`)
Files are stubbed. Implementation is complete — no changes needed.

Routes:
- `GET  /api/game/posts` — return all posts where `isApproved = true`
- `POST /api/game/sessions` — save game result, set `isVerified = true` on user if verdict is `ACCESS GRANTED`

---

## Web

### Auth hook (`app/web/src/features/auth/hooks/useAuth.ts`)
Already implemented. Exposes `register`, `login`, `logout`, `user`.

### Game hook (`app/web/src/features/game/hooks/useGame.ts`)
Already implemented. Exposes `getPosts`, `saveGame`.

### Login page (`app/web/src/features/auth/pages/LoginPage.tsx`)
Build a register/login form:
- Toggle between register and login mode
- Call `useAuth().register` or `useAuth().login`
- On success redirect to `/`

### Game page (`app/web/src/features/game/pages/GamePage.tsx`)
This is the main feature. Port the canvas game from the prototype into a React component.

#### Step 1 — Copy game engine files as-is
Copy these files into `app/web/src/features/game/`:
- `prototype/game/engine.js` → `engine.ts`
- `prototype/game/world.js`  → `world.ts`

Strip out the `window.DATA` / `window.DOAI` references — replace with the API hook.

#### Step 2 — Mount the canvas
In `GamePage.tsx`, render a `<canvas id="game">` inside a wrapper div and initialise the engine inside a `useEffect`:

```tsx
useEffect(() => {
  // fetch posts from API, pass to engine, start loop
}, []);
```

#### Step 3 — Wire posts from API
Call `useGame().getPosts()` on mount. Pass the returned posts array into the engine's `buildPool` function (replacing the `window.DATA.TEXT_ROUNDS` / `IMAGE_ROUNDS` that the prototype used).

Post shape expected by engine:
```ts
{
  kind: 'human' | 'ai'
  name: string
  handle: string
  av: string        // single char avatar
  body?: string
  imageUrl?: string
  topic: string
  tells: string[]   // parsed from JSON string
}
```
Note: `tells` comes from the API as a JSON string — parse it before passing to the engine.

#### Step 4 — Save session on game end
The engine calls `endGame()` when the round finishes. Hook into that to call `useGame().saveGame(payload)` with the final stats.

#### Step 5 — Auth gate after passing
When verdict is `ACCESS GRANTED`, show the login/register modal (the prototype's `#auth` overlay). On successful auth, redirect to `/discuss`.

#### Step 6 — Protect `/discuss` route
In `app/web/src/router.tsx`, wrap the discussion route with an auth guard that checks `useAuthStore().user?.isVerified`. If not verified, redirect to `/?gate=discuss` so the game shows the gate notice.

---

## Checklist

### API
- [ ] `POST /api/auth/register` works and returns user
- [ ] `POST /api/auth/login` sets cookie and returns user
- [ ] `POST /api/auth/logout` clears cookie
- [ ] `GET  /api/auth/me` returns current user
- [ ] `GET  /api/game/posts` returns approved posts with parsed tells
- [ ] `POST /api/game/sessions` saves result and sets isVerified on ACCESS GRANTED

### Web
- [ ] LoginPage — register/login form, redirects to `/` on success
- [ ] GamePage — canvas renders and game loop starts
- [ ] Posts loaded from API replace hardcoded prototype data
- [ ] Game session saved to API on round end
- [ ] Auth modal appears after ACCESS GRANTED verdict
- [ ] `/discuss` route is gated — redirects to game if not verified

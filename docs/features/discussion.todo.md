# Dev 3 — Discussion

Reference prototype: `docs/prototype/Discuss.html`

---

## API

### Discussion (`app/api/src/features/discussion/`)
Files are stubbed. Implementation is complete — no changes needed.

Routes:
- `GET  /api/discussion/threads`                   — list all threads, ordered by `createdAt desc`
- `POST /api/discussion/threads`                   — create thread (requires auth, requires `isVerified`)
- `GET  /api/discussion/threads/:id`               — single thread with nested comments and votes
- `POST /api/discussion/threads/:id/comments`      — add comment or reply (requires auth)
- `POST /api/discussion/votes`                     — upsert vote on thread or comment (requires auth)

#### Add `requireVerified` middleware
Only verified humans can post threads and comments. Add this to `app/api/src/common/middleware/auth.middleware.ts`:

```ts
export function requireVerified(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.isVerified) return next(forbidden());
  next();
}
```

Apply it after `requireAuth` on thread creation and comment creation routes.

#### Vote upsert logic (already in service)
`discussion.service.ts` — `vote()` uses Prisma `upsert`. If the user votes the same value twice it toggles off (delete the row). Add that toggle:

```ts
// in vote(), after upsert — if re-voting same value, delete instead
const existing = await prisma.vote.findFirst({ where: ... });
if (existing?.value === data.value) {
  await prisma.vote.delete({ where: { id: existing.id } });
  return null;
}
```

---

## Web

### Discussion hook (`app/web/src/features/discussion/hooks/useDiscussion.ts`)
Already implemented. Exposes `getThreads`, `getThread`, `createThread`, `createComment`, `vote`.

### Discussion page (`app/web/src/features/discussion/pages/DiscussionPage.tsx`)
Two-column layout: thread list + composer on the left, sidebar on the right.

#### Thread list
- Fetch threads on mount with `useDiscussion().getThreads()`
- **Poll every 10 seconds** — `setInterval(() => getThreads(), 10_000)` in a `useEffect`, clear on unmount
- Sort tabs: Hot (votes / age decay), New (createdAt), Top (votes) — sort client-side
- Each thread card shows: flair badge, author handle, time ago, title, body excerpt, comment count, vote count

#### Composer
- Collapsed by default — clicking expands it
- Fields: flair picker (HUMAN / BOT / META / STRATEGY / GLITCH), title, body
- Submit calls `useDiscussion().createThread()`
- Only show composer if `useAuthStore().user?.isVerified` is true, otherwise show a "pass the game to post" notice

#### Thread expand — comments
- Clicking comment count on a thread calls `getThread(id)` and renders comments inline
- Nested replies up to 2 levels (reply box opens inline under each comment)
- Comment submit calls `createComment(threadId, { body, parentId? })`

#### Voting
- Up/down buttons on threads and comments call `useDiscussion().vote()`
- Highlight active vote state from the response

#### Sidebar
- House Rules (static)
- Flair legend (static)
- Member count (static or from a future `/api/stats` endpoint — leave as static for now)

#### Auth guard
Page requires `isVerified`. If `useAuthStore().user?.isVerified` is false or user is null, redirect to `/?gate=discuss`.

---

## Checklist

### API
- [ ] `GET /api/discussion/threads` returns threads with comment count and vote sum
- [ ] `POST /api/discussion/threads` requires auth + isVerified
- [ ] `GET /api/discussion/threads/:id` returns thread with nested comments and votes
- [ ] `POST /api/discussion/threads/:id/comments` requires auth + isVerified, supports `parentId`
- [ ] `POST /api/discussion/votes` upserts vote, toggles off on same value
- [ ] `requireVerified` middleware added and applied

### Web
- [ ] DiscussionPage renders thread list on mount
- [ ] Threads poll every 10 seconds
- [ ] Sort tabs (Hot / New / Top) work client-side
- [ ] Composer visible only to verified users
- [ ] Thread creation works and new thread appears in list
- [ ] Comments expand inline on thread click
- [ ] Nested replies render correctly
- [ ] Comment submission works
- [ ] Voting updates count visually
- [ ] Page redirects to `/?gate=discuss` if not verified

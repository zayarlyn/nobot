# Dev 2 — Contribute

Reference prototype: `docs/prototype/Contribute.html`

---

## API

### Contribute (`app/api/src/features/contribute/`)
Files are stubbed. Implementation is complete — no changes needed.

Routes:
- `POST   /api/contribute`          — submit a post (requires auth), saves with `source: USER`, `isApproved: false`
- `GET    /api/contribute/pending`  — list all unapproved posts (admin use)
- `PATCH  /api/contribute/:id/approve` — approve a post so it appears in gameplay

---

## Web

### Contribute hook (`app/web/src/features/contribute/hooks/useContribute.ts`)
Already implemented. Exposes `submitPost`.

### Contribute page (`app/web/src/features/contribute/pages/ContributePage.tsx`)
Two-column layout: form on the left, live preview + submissions list on the right.

#### Form fields
| Field | Type | Notes |
|-------|------|-------|
| Topic | select | News, Sports, Politics, Pop Culture |
| Post body | textarea | max 280 chars, show char count |

- The post is always submitted as `kind: 'human'` (the contributor is human — their post represents a real human voice)
- `name` and `handle` are derived from the logged-in user (`useAuthStore().user.username`)
- `avatar` is `username[0].toUpperCase()`
- `tells` can be an empty array on submission — admin fills these at approval time

#### Live preview rail (right column)
Mirror the prototype's preview card — update in real time as the user types:
- Show avatar initial, display name, handle
- Show post body (grey placeholder text when empty)

#### Submissions list (below preview)
After submitting, show the user's own pending submissions fetched from the API.
Each row shows: kind badge, truncated body, handle · topic, delete button.

Delete calls `DELETE /api/contribute/:id` — add this route:
- `app/api/src/features/contribute/contribute.routes.ts` — add `router.delete('/:id', requireAuth, contributeController.deletePost)`
- `app/api/src/features/contribute/contribute.service.ts` — add `deletePost(id, userId)` (only delete own posts)
- `app/api/src/features/contribute/contribute.controller.ts` — add `deletePost` handler

#### Auth guard
Page requires login. If `useAuthStore().user` is null, redirect to `/login`.

---

## Checklist

### API
- [ ] `POST /api/contribute` saves post with correct fields
- [ ] `GET /api/contribute/pending` returns unapproved posts
- [ ] `PATCH /api/contribute/:id/approve` sets `isApproved: true`
- [ ] `DELETE /api/contribute/:id` deletes own post (add this)

### Web
- [ ] ContributePage renders two-column layout
- [ ] Form submits and calls `useContribute().submitPost`
- [ ] Live preview updates as user types
- [ ] Submissions list shows user's posts from API
- [ ] Delete button removes a submission
- [ ] Page redirects to `/login` if not authenticated

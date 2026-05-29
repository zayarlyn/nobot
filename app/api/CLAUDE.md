## Folder structure — Backend (app/api/src)

Every feature lives in its own folder under src/features/:

- `*.routes.ts` — route wiring only, no logic
- `*.controller.ts` — HTTP layer only, calls service, no DB queries
- `*.service.ts` — all business logic and Prisma queries, no req/res
- `*.dto.ts` — Zod schemas only

Shared code lives in src/common/:

- `common/utils/` — asyncHandler, errors, response helpers
- `common/middleware/` — auth, validate, error middleware
- `common/lib/` — prisma singleton

Never put database queries in controllers.
Never put req/res objects in services.
Never import from another feature's service directly — go through the route layer.

---

## Patterns — always follow these exactly

### Controllers

Always wrap with asyncHandler. Always use success() — never raw res.json():

```typescript
import asyncHandler from '../../common/utils/asyncHandler';
import { success } from '../../common/utils/response';

export const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getById(Number(req.params.id));
  return success(res, post);
});
```

Never write try/catch in controllers — asyncHandler handles this.

### Error handling

Always use helpers from common/utils/errors.ts:

```typescript
import { notFound, forbidden, badRequest, conflict, unauthorized } from '../../common/utils/errors';

if (!post) throw notFound('Post');
if (post.authorId !== req.user!.id) throw forbidden();
```

Never use raw `res.status(404).json(...)`.

### Validation

Always validate with the validate middleware via the dto:

```typescript
import { validate } from '../../common/middleware/validate.middleware';
import { CreateThreadDto } from './discussion.dto';

router.post('/threads', requireAuth, validate(CreateThreadDto, 'body'), discussionController.createThread);
```

### Auth

Always use `requireAuth` from common/middleware/auth.middleware.ts.
Use `requireVerified` for routes that require the user to have passed the game (discussion posts, comments).

```typescript
import { requireAuth, requireVerified } from '../../common/middleware/auth.middleware';

router.post('/threads', requireAuth, requireVerified, validate(CreateThreadDto, 'body'), controller.createThread);
```

### Database

Always use the Prisma singleton from common/lib/prisma.ts:

```typescript
import prisma from '../../common/lib/prisma';
```

Wrap multi-table writes in a transaction:

```typescript
await prisma.$transaction(async (tx) => {
  const game = await tx.game.create({ ... });
  await tx.user.update({ ... });
  return game;
});
```

Never instantiate PrismaClient more than once.
Never write raw SQL strings.

### Response format

```typescript
// single resource
return success(res, data);

// created resource
return success(res, data, 201);

// no content
return success(res, null, 204);
```

---

## Always check common before writing anything new

| Need | Import from |
|------|-------------|
| Async controller wrapper | `../../common/utils/asyncHandler` |
| Error helpers (notFound, forbidden, badRequest, conflict, unauthorized) | `../../common/utils/errors` |
| Response helper (success) | `../../common/utils/response` |
| Prisma client | `../../common/lib/prisma` |
| Auth middleware (requireAuth, requireVerified) | `../../common/middleware/auth.middleware` |
| Request validation middleware | `../../common/middleware/validate.middleware` |
| Global error handler | `../../common/middleware/error.middleware` |

- Never create a new PrismaClient — import from common/lib/prisma
- Never write a new error helper — use existing helpers from common/utils/errors
- Never write try/catch in a controller — use asyncHandler
- Never write raw res.json() — use success()
- If something you need does not exist in common yet, create it there first then import it

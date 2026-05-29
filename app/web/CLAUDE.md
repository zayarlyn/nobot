## Folder structure — Frontend (app/web/src)

Every feature lives in its own folder under src/features/:

- `features/<feature>/pages/` — page-level components, one per route
- `features/<feature>/components/` — feature-specific components
- `features/<feature>/hooks/` — plain axios hooks, one file per feature

Shared code lives in src/common/:

- `common/components/` — shared components used across features
- `common/store/` — Zustand stores
- `common/lib/` — axios instance, utils

Never import a feature's internal component from another feature.
Always import shared components from common/components.
Never write axios calls directly in components — always use a hook.
Never read from useAuthStore directly in components — go through useAuth hook.

---

## Patterns — always follow these exactly

### Axios hooks

All API calls live in hooks, never in components. Hooks are plain async functions — no React Query:

```typescript
// features/discussion/hooks/useDiscussion.ts
import api from '../../../common/lib/api';

export function useDiscussion() {
  async function getThreads() {
    const { data } = await api.get('/discussion/threads');
    return data.data;
  }

  async function createThread(payload: { flair: string; title: string; body?: string }) {
    const { data } = await api.post('/discussion/threads', payload);
    return data.data;
  }

  return { getThreads, createThread };
}
```

Call hooks inside components with useState + useEffect for fetching:

```typescript
const [threads, setThreads] = useState([]);
const { getThreads } = useDiscussion();

useEffect(() => {
  getThreads().then(setThreads);
}, []);
```

Never call api directly in a component.
Always use named exports for hooks, default exports for components and pages.

### Axios instance

Always import the configured instance:

```typescript
import api from '../../../common/lib/api';
```

Never import axios directly in feature code.

### Auth

Always read auth state through useAuth:

```typescript
import { useAuth } from '../../auth/hooks/useAuth';
const { user, login, logout } = useAuth();
```

Never read from useAuthStore directly in components.

### Navigation

Always use TanStack Router hooks for navigation:

```typescript
import { useNavigate } from '@tanstack/react-router';
const navigate = useNavigate();
navigate({ to: '/discuss' });
```

Never use window.location for navigation.

### Components

Always define TypeScript interfaces for props.
Never use React.FC — use plain function declarations:

```typescript
interface ThreadCardProps {
  thread: Thread;
  onVote: (value: 1 | -1) => void;
}

export default function ThreadCard({ thread, onVote }: ThreadCardProps) { ... }
```

### Polling

For pages that need periodic refresh (e.g. discussion), use setInterval in useEffect:

```typescript
useEffect(() => {
  getThreads().then(setThreads);
  const id = setInterval(() => getThreads().then(setThreads), 10_000);
  return () => clearInterval(id);
}, []);
```

### Tailwind

Always use Tailwind classes for styling. Use inline styles only for dynamic values that cannot be expressed in Tailwind (e.g. canvas dimensions, prototype CSS variables):

```typescript
// correct
<div className="flex flex-col gap-2 bg-gray-900 border border-gray-700 rounded-lg p-4" />

// acceptable — dynamic value not expressible in Tailwind
<div style={{ width: `${pct}%` }} />
```

---

## Always check common before writing anything new

| Need | Import from |
|------|-------------|
| Axios instance | `../../../common/lib/api` |
| Auth state + actions | `../../auth/hooks/useAuth` |
| Auth store (write only) | `../../../common/store/authStore` |
| Navbar | `../../../common/components/Navbar` |
| Button (all variants) | `../../../common/components/Button` |
| Avatar | `../../../common/components/Avatar` |
| Badge (status + flair) | `../../../common/components/Badge` |
| Post card | `../../../common/components/PostCard` |
| Stat card (label + value) | `../../../common/components/StatCard` |
| Meter / progress bar | `../../../common/components/MeterBar` |
| Loading spinner | `../../../common/components/LoadingSpinner` |
| Empty state | `../../../common/components/EmptyState` |

- Never create a new axios instance — import from common/lib/api
- Never create a new Button, Avatar, Badge, Spinner, or PostCard — they exist in common/components
- Never read useAuthStore directly in a component — go through useAuth
- Never write axios calls in a component — put them in a hook
- If a component is used by more than one feature, move it to common/components first
- If something you need does not exist in common yet, create it there first and then import it

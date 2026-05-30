import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { useAuthStore } from './common/store/authStore';
import App from './app';
import LoginPage from './features/auth/pages/LoginPage';
import GamePage from './features/game/pages/GamePage';
import ContributePage from './features/contribute/pages/ContributePage';
import DiscussionPage from './features/discussion/pages/DiscussionPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import LeaderboardPage from './features/profile/pages/LeaderboardPage';

const rootRoute = createRootRoute({ component: App });

function requireGamePassed() {
  const { user, hydrated } = useAuthStore.getState();
  if (!hydrated) return; // still loading; router.invalidate() will re-run after hydration
  if (!user || !sessionStorage.getItem('gamePassed')) throw redirect({ to: '/' });
}

const loginRoute      = createRoute({ getParentRoute: () => rootRoute, path: '/login',       component: LoginPage });
const gameRoute       = createRoute({ getParentRoute: () => rootRoute, path: '/',            component: GamePage });
const contributeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contribute',  component: ContributePage, beforeLoad: requireGamePassed });
const discussionRoute = createRoute({ getParentRoute: () => rootRoute, path: '/discuss',     component: DiscussionPage, beforeLoad: requireGamePassed });
const profileRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/profile',     component: ProfilePage,    beforeLoad: requireGamePassed });
const leaderboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/leaderboard', component: LeaderboardPage, beforeLoad: requireGamePassed });

const routeTree = rootRoute.addChildren([
  loginRoute, gameRoute, contributeRoute, discussionRoute, profileRoute, leaderboardRoute,
]);

export const router = createRouter({ routeTree });

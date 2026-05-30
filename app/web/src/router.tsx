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

const loginRoute      = createRoute({ getParentRoute: () => rootRoute, path: '/login',       component: LoginPage });
const gameRoute       = createRoute({ getParentRoute: () => rootRoute, path: '/',            component: GamePage });
const contributeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/contribute',  component: ContributePage });
const discussionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discuss',
  component: DiscussionPage,
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user?.isVerified) {
      throw redirect({ to: '/', search: { gate: 'discuss' } });
    }
  },
});
const profileRoute    = createRoute({ getParentRoute: () => rootRoute, path: '/profile',     component: ProfilePage });
const leaderboardRoute = createRoute({ getParentRoute: () => rootRoute, path: '/leaderboard', component: LeaderboardPage });

const routeTree = rootRoute.addChildren([
  loginRoute, gameRoute, contributeRoute, discussionRoute, profileRoute, leaderboardRoute,
]);

export const router = createRouter({ routeTree });

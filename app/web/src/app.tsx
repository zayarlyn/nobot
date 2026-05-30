import { useEffect } from 'react';
import { Outlet, useRouter } from '@tanstack/react-router';
import Navbar from './common/components/Navbar';
import LoadingSpinner from './common/components/LoadingSpinner';
import api from './common/lib/api';
import { useAuthStore } from './common/store/authStore';

const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (nav?.type === 'reload') sessionStorage.removeItem('gamePassed');

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.data))
      .catch(async () => {
        if (import.meta.env.DEV) {
          await api.post('/auth/login', { username: 'demo', password: 'password' })
            .then(({ data }) => setUser(data.data))
            .catch(() => {/* seed not run yet */});
        }
      })
      .finally(() => {
        setHydrated();
        router.invalidate();
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        {hydrated ? <Outlet /> : <LoadingSpinner />}
      </main>
    </div>
  );
}

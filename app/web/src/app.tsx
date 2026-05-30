import { useEffect } from 'react';
import { Outlet } from '@tanstack/react-router';
import Navbar from './common/components/Navbar';
import api from './common/lib/api';
import { useAuthStore } from './common/store/authStore';

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    // restore session from existing cookie
    api.get('/auth/me')
      .then(({ data }) => setUser(data.data))
      .catch(() => {
        // in dev, auto-login as the seeded demo user so pages work without visiting /login
        if (import.meta.env.DEV) {
          api.post('/auth/login', { username: 'demo', password: 'password' })
            .then(({ data }) => setUser(data.data))
            .catch(() => {/* seed not run yet */});
        }
      });
  }, []);

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  );
}

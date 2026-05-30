import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { authorize } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) { setError('Enter a username.'); return; }
    if (!password) { setError('Enter a password.'); return; }
    setLoading(true);
    setError('');
    try {
      await authorize(username.trim(), password);
      navigate({ to: '/' });
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number; data?: { message?: string } } };
      setError(axErr?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div style={{ width: '100%', maxWidth: 420 }} className="flex flex-col gap-4">
        <div className="eyebrow text-center">Authorize</div>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="auth-inp"
            type="text"
            placeholder="USERNAME"
            maxLength={32}
            autoComplete="username"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="auth-inp"
            type="password"
            placeholder="PASSWORD"
            maxLength={64}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--magenta)' }}>{error}</div>
          )}
          <button className="btn solid-green lg block" type="submit" disabled={loading}>
            {loading ? '...' : 'AUTHORIZE ▸'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import Avatar from '../../../common/components/Avatar';
import Badge from '../../../common/components/Badge';
import StatCard from '../../../common/components/StatCard';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import EmptyState from '../../../common/components/EmptyState';

type Game = {
  id: number;
  score: number;
  accuracy: number;
  verdict: string;
  streak: number;
  createdAt: string;
};

type Profile = {
  id: number;
  username: string;
  isVerified: boolean;
  createdAt: string;
  games: Game[];
};

type StatusVariant = 'survivor' | 'flagged' | 'assimilated';

function statusFromAccuracy(acc: number): StatusVariant {
  if (acc >= 80) return 'survivor';
  if (acc >= 60) return 'flagged';
  return 'assimilated';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getProfile } = useProfile();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate({ to: '/login' }); return; }
    getProfile(user.id).then((p) => { setProfile(p); setLoading(false); });
  }, []);

  if (!user) return null;
  if (loading) return <LoadingSpinner size="lg" />;
  if (!profile) return <EmptyState message="Profile not found" />;

  const lastAcc = profile.games[0]?.accuracy ?? 0;
  const status = statusFromAccuracy(lastAcc);
  const sessions = profile.games.length;
  const bestScore = profile.games.reduce((m, g) => Math.max(m, g.score), 0);

  return (
    <div className="screen flex flex-col gap-5">
      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg))', border: '1px solid var(--line-2)', borderRadius: 'var(--radius)', padding: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(420px 200px at 88% -20%, rgba(52,231,255,.1), transparent 70%)' }} />
        <div className="flex items-center gap-5">
          <Avatar initial={profile.username[0]} size="lg" verified={profile.isVerified} />
          <div className="flex flex-col gap-2 min-w-0">
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '.01em', wordBreak: 'break-all' }}>
              @{profile.username}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
                Joined {formatDate(profile.createdAt)}
              </span>
              <Badge variant={status} />
              {profile.isVerified && <Badge variant="verified" label="◉ Verified Human" />}
            </div>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Sessions" value={sessions} />
        <StatCard label="Best Score" value={bestScore.toLocaleString('en-US')} valueClassName="neon-cyan" />
      </div>

      {/* Audit history */}
      <div style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg))', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">Audit History</span>
          <span className="eyebrow" style={{ color: 'var(--ink-faint)' }}>{sessions} sessions</span>
        </div>

        {sessions === 0 ? (
          <EmptyState message="No sessions yet — play a game to record your first audit" />
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid gap-3 px-4 pb-1" style={{ gridTemplateColumns: '80px 1fr 90px 90px 1fr' }}>
              {['Mode', 'Verdict', 'Score', 'Acc.', 'When'].map((h) => (
                <span key={h} style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{h}</span>
              ))}
            </div>
            {profile.games.map((g) => (
              <div key={g.id} className="grid items-center gap-3 px-4 py-3" style={{ gridTemplateColumns: '80px 1fr 90px 90px 1fr', background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 12, letterSpacing: '.1em', color: 'var(--ink-dim)' }}>PURGE</span>
                <Badge variant={statusFromAccuracy(g.accuracy)} />
                <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: 'var(--cyan)', textShadow: 'var(--cyan-glow)' }}>
                  {g.score.toLocaleString('en-US')}
                </span>
                <span style={{ fontFamily: 'var(--display)', fontSize: 14, color: g.accuracy >= 80 ? 'var(--green)' : g.accuracy >= 60 ? 'var(--ink)' : 'var(--magenta)' }}>
                  {g.accuracy}%
                </span>
                <span style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--ink-faint)', whiteSpace: 'nowrap' }}>
                  {formatDate(g.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

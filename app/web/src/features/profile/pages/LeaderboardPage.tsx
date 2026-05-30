import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useProfile } from '../hooks/useProfile';
import Badge from '../../../common/components/Badge';
import StatCard from '../../../common/components/StatCard';
import MeterBar from '../../../common/components/MeterBar';
import LoadingSpinner from '../../../common/components/LoadingSpinner';

type LeaderboardRow = {
  id: number;
  username: string;
  isVerified: boolean;
  score: number;
  accuracy: number;
  streak: number;
};

type StatusVariant = 'survivor' | 'flagged' | 'assimilated';
type SortMode = 'accuracy' | 'karma';

function statusFromAccuracy(acc: number): StatusVariant {
  if (acc >= 80) return 'survivor';
  if (acc >= 60) return 'flagged';
  return 'assimilated';
}

const POD_CONFIG = [
  { cls: 'p2', medal: '02', topColor: 'var(--ink-dim)', isFirst: false },
  { cls: 'p1', medal: '01 · APEX', topColor: 'var(--cyan)', isFirst: true },
  { cls: 'p3', medal: '03', topColor: '#8a5a2b', isFirst: false },
] as const;

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { getLeaderboard } = useProfile();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SortMode>('accuracy');

  useEffect(() => {
    getLeaderboard().then((data) => { setRows(data ?? []); setLoading(false); });
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;

  const sorted = [...rows].sort((a, b) =>
    mode === 'karma'
      ? Math.round(b.score / 10) - Math.round(a.score / 10)
      : b.score - a.score
  );

  // podium: render as [2nd, 1st, 3rd]
  const top3 = sorted.slice(0, 3);
  const podiumSlots = [top3[1], top3[0], top3[2]];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="eyebrow neon-cyan">NOBOT · LEADERBOARD</span>
        <h1 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 'clamp(30px, 6vw, 54px)', lineHeight: 0.98, letterSpacing: '.01em', margin: 0 }}>
          RANKINGS
        </h1>
        <p style={{ color: 'var(--ink-dim)', fontSize: 13, lineHeight: 1.6, maxWidth: '60ch', margin: 0 }}>
          Ranked by <b style={{ color: 'var(--cyan)' }}>NOBOT Score</b> — how reliably each member tells human from synthetic.
        </p>
      </div>

      {/* Network strip */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Registered Members" value={rows.length.toLocaleString('en-US')} valueClassName="neon-green" />
        <StatCard label="Active This Week" value="—" valueClassName="neon-cyan" />
        <StatCard label="Human Content" value="—" valueClassName="neon-green" />
      </div>

      {/* Podium */}
      {top3.length >= 2 && (
        <div className="grid gap-3 items-end" style={{ gridTemplateColumns: '1fr 1.15fr 1fr' }}>
          {POD_CONFIG.map(({ cls, medal, topColor, isFirst }, i) => {
            const r = podiumSlots[i];
            if (!r) return <div key={cls} />;
            const displayValue = mode === 'karma' ? Math.round(r.score / 10) : r.score;
            return (
              <div key={r.id} style={{ background: 'linear-gradient(180deg, var(--bg-1), var(--bg))', border: `1px solid ${isFirst ? 'var(--cyan-d)' : 'var(--line-2)'}`, borderRadius: 'var(--radius)', padding: isFirst ? '26px 14px 18px' : '18px 14px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: isFirst ? '0 0 34px rgba(52,231,255,.12)' : undefined }}>
                <div style={{ position: 'absolute', inset: '0 0 auto 0', height: 2, background: topColor, boxShadow: isFirst ? 'var(--cyan-glow)' : undefined }} />
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13, letterSpacing: '.14em', color: isFirst ? 'var(--cyan)' : 'var(--ink-faint)' }}>
                  {medal}
                </div>
                <div style={{ width: isFirst ? 66 : 56, height: isFirst ? 66 : 56, margin: '12px auto 10px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontSize: isFirst ? 22 : 18, color: isFirst ? 'var(--cyan)' : 'var(--ink)', background: 'linear-gradient(135deg, var(--bg-3), var(--line-2))', border: `1px solid ${isFirst ? 'var(--cyan-d)' : 'var(--line-2)'}`, boxShadow: isFirst ? 'var(--cyan-glow)' : undefined }}>
                  {r.username[0].toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink)', wordBreak: 'break-all', lineHeight: 1.3 }}>{r.username}</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: isFirst ? 32 : 26, marginTop: 8, color: isFirst ? 'var(--cyan)' : 'var(--ink)', textShadow: isFirst ? 'var(--cyan-glow)' : undefined }}>
                  {displayValue.toLocaleString('en-US')}
                </div>
                <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--ink-faint)', marginTop: 4 }}>
                  {mode === 'karma' ? `${r.streak} streak` : `${r.accuracy}% accurate`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="eyebrow">{mode === 'karma' ? 'Karma Ranking' : 'Accuracy Ranking'}</span>
        <div className="flex gap-1">
          {(['accuracy', 'karma'] as SortMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} className={`nav-btn${mode === m ? ' active' : ''}`}>
              {m === 'accuracy' ? 'Accuracy' : 'Karma'}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings table */}
      <div className="flex flex-col gap-2">
        <div className="grid items-center gap-3 px-4 pb-1" style={{ gridTemplateColumns: '48px 1fr 130px 96px 116px' }}>
          {['#', 'Member', mode === 'karma' ? 'Karma' : 'Score', 'Accuracy', 'Status'].map((h) => (
            <span key={h} style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>{h}</span>
          ))}
        </div>
        {sorted.map((r, i) => {
          const isMe = user?.id === r.id;
          const displayValue = mode === 'karma' ? Math.round(r.score / 10) : r.score;
          return (
            <div key={r.id} className="grid items-center gap-3 px-4 py-3" style={{ gridTemplateColumns: '48px 1fr 130px 96px 116px', background: 'var(--bg-1)', border: `1px solid ${isMe ? 'var(--green-d)' : 'var(--line)'}`, borderRadius: 'var(--radius)', boxShadow: isMe ? 'inset 0 0 20px rgba(77,255,176,.08)' : undefined }}>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17, color: isMe ? 'var(--green)' : 'var(--ink-dim)', textAlign: 'center' }}>
                {i + 1}
              </span>
              <div className="flex items-center gap-3 min-w-0">
                <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', fontFamily: 'var(--display)', fontSize: 14, color: isMe ? 'var(--green)' : 'var(--ink-dim)', background: 'linear-gradient(135deg, var(--bg-3), var(--line-2))', border: `1px solid ${isMe ? 'var(--green-d)' : 'var(--line-2)'}` }}>
                  {r.username[0].toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span style={{ fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</span>
                  <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: isMe ? 'var(--green)' : 'var(--ink-faint)' }}>
                    {isMe ? 'YOU · ' : ''}{r.streak} streak
                  </span>
                  {isMe && r.isVerified && (
                    <Badge variant="verified" label="◉ Verified Human" />
                  )}
                </div>
              </div>
              <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 19, color: 'var(--cyan)', textShadow: 'var(--cyan-glow)' }}>
                {displayValue.toLocaleString('en-US')}
              </span>
              <div className="flex flex-col gap-1">
                <span style={{ fontSize: 11, color: 'var(--ink-dim)', fontFamily: 'var(--display)' }}>{r.accuracy}%</span>
                <MeterBar value={r.accuracy} />
              </div>
              <Badge variant={statusFromAccuracy(r.accuracy)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

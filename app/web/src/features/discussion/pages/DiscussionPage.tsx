import { useState, useEffect, useMemo } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useAuth } from '../../auth/hooks/useAuth';
import ThreadCard from '../components/ThreadCard';
import ThreadComposer from '../components/ThreadComposer';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import '../discussion.css';

interface PreviewComment {
  id: number;
  body: string;
  createdAt: string;
  author: { id: number; username: string };
  parentId: number | null;
}

interface Thread {
  id: number;
  flair: 'HUMAN' | 'BOT' | 'META' | 'STRATEGY' | 'GLITCH';
  title: string;
  body?: string;
  createdAt: string;
  author: { id: number; username: string };
  voteTotal: number;
  commentCount: number;
  lastActivityAt: string;
  previewComments: PreviewComment[];
}

type SortMode = 'hot' | 'new' | 'top';

const SORT_LABELS: Record<SortMode, string> = {
  hot: 'RANKED BY HEAT',
  new: 'NEWEST FIRST',
  top: 'MOST UPVOTED',
};

const FLAIR_DATA = {
  HUMAN:    { color: 'var(--green)' },
  BOT:      { color: 'var(--cyan)' },
  META:     { color: 'var(--amber)' },
  STRATEGY: { color: '#c9a6ff' },
  GLITCH:   { color: 'var(--magenta)' },
};

function heat(t: Thread) {
  const hrs = (Date.now() - new Date(t.createdAt).getTime()) / 3_600_000;
  return t.voteTotal / Math.pow(hrs + 2, 1.3);
}

export default function DiscussionPage() {
  const { getThreads } = useDiscussion();
  const { user } = useAuth();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  const [openReplyId, setOpenReplyId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = () =>
      getThreads().then((data) => {
        if (mounted) { setThreads(data); setLoading(false); }
      });
    fetchData();
    const id = setInterval(fetchData, 10_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = q
      ? threads.filter((t) => t.title.toLowerCase().includes(q) || (t.body ?? '').toLowerCase().includes(q))
      : threads;
    if (sortMode === 'new') result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortMode === 'top') result = [...result].sort((a, b) => b.voteTotal - a.voteTotal);
    else result = [...result].sort((a, b) => heat(b) - heat(a));
    return result;
  }, [threads, searchQuery, sortMode]);

  function handleToggleReply(id: number) {
    setOpenReplyId((prev) => (prev === id ? null : id));
  }

  function handleReplyPosted(threadId: number, comment: PreviewComment) {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, commentCount: t.commentCount + 1, lastActivityAt: comment.createdAt,
              previewComments: [...t.previewComments, comment] }
          : t
      )
    );
    setOpenReplyId(null);
  }

  function handleThreadPosted(raw: any) {
    const thread: Thread = {
      ...raw, voteTotal: 0, commentCount: 0,
      lastActivityAt: raw.createdAt, previewComments: [],
    };
    setThreads((prev) => [thread, ...prev]);
  }

  return (
    <main className="screen wrap">
      <div className="dc-head">
        <div className="eyebrow neon-cyan">COMMUNITY · r/nobot</div>
        <h1 className="dc-title glitch" data-text="THE HOLDOUTS">THE HOLDOUTS</h1>
        <p className="dc-sub">
          Where the last verified humans compare tells, call out bot farms, and argue about whether any of us are still real.
          Post a theory, upvote a good catch, reply in the threads.
        </p>
        <div className="dc-meta-strip">
          <span><b className="neon-green">11,842</b> HUMANS</span>
          <span><b className="neon-cyan">348</b> SCANNING NOW</span>
          <span><b>{threads.length}</b> THREADS</span>
        </div>
      </div>

      <div className="dc-layout">
        <div>
          {user?.isVerified && <ThreadComposer onPosted={handleThreadPosted} />}

          <div className="scanner">
            <label>ACTIVATE SCANNER</label>
            <input
              type="text"
              className="inp"
              placeholder="search threads…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim() && (
              <div className="scanner-match">
                {filteredThreads.length} MATCH{filteredThreads.length !== 1 ? 'ES' : ''} FOUND
              </div>
            )}
          </div>

          <div className="sortbar">
            <div className="seg">
              {(['hot', 'new', 'top'] as SortMode[]).map((s) => (
                <button key={s} className={sortMode === s ? 'on' : ''} onClick={() => setSortMode(s)}>
                  {s}
                </button>
              ))}
            </div>
            <span className="eyebrow" style={{ marginLeft: 'auto', color: 'var(--ink-faint)' }}>
              {SORT_LABELS[sortMode]}
            </span>
          </div>

          {loading && <div className="spinner-wrap"><div className="spinner lg" /></div>}

          {!loading && filteredThreads.length === 0 && (
            <div className="dc-empty">
              {searchQuery.trim() ? '⚠️ SIGNAL LOST' : 'No threads yet. Be the first to post a sighting.'}
            </div>
          )}

          {!loading && filteredThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              searchQuery={searchQuery}
              isReplyOpen={openReplyId === thread.id}
              onToggleReply={() => handleToggleReply(thread.id)}
              onReplyPosted={(comment) => handleReplyPosted(thread.id, comment)}
            />
          ))}
        </div>

        <aside className="dc-side">
          <div className="side-card">
            <h3>House Rules</h3>
            <div className="rule"><span className="n">1</span><span>Post the evidence. "Trust me it's a bot" gets you flagged.</span></div>
            <div className="rule"><span className="n">2</span><span>No doxxing suspected humans. They're endangered.</span></div>
            <div className="rule"><span className="n">3</span><span>Confirmed synthetic accounts go in BOT-ALERT with receipts.</span></div>
          </div>
          <div className="side-card">
            <h3>Flair Legend</h3>
            <div className="flair-legend">
              {(['HUMAN', 'BOT', 'META', 'STRATEGY', 'GLITCH'] as const).map((f) => (
                <div key={f} className="fl">
                  <span className="swatch" style={{ background: FLAIR_DATA[f].color }} />
                  {f === 'HUMAN' ? 'HUMAN-SIGHTING' : f === 'BOT' ? 'BOT-ALERT' : f}
                </div>
              ))}
            </div>
          </div>
          <a href="/" className="btn cyan block">▸ BACK TO THE PURGE</a>
        </aside>
      </div>
    </main>
  );
}

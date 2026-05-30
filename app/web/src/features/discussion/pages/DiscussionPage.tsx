import { useState, useEffect, useMemo } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useAuth } from '../../auth/hooks/useAuth';
import ThreadCard from '../components/ThreadCard';
import ThreadComposer from '../components/ThreadComposer';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import Button from '../../../common/components/Button';

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

export default function DiscussionPage() {
  const { getThreads } = useDiscussion();
  const { user } = useAuth();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'new' | 'top'>('new');
  const [openReplyId, setOpenReplyId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetch = () =>
      getThreads().then((data) => {
        if (mounted) { setThreads(data); setLoading(false); }
      });
    fetch();
    const id = setInterval(fetch, 10_000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = q
      ? threads.filter(
          (t) => t.title.toLowerCase().includes(q) || (t.body ?? '').toLowerCase().includes(q)
        )
      : threads;
    if (sortMode === 'top') result = [...result].sort((a, b) => b.voteTotal - a.voteTotal);
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
    setShowComposer(false);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 tracking-widest">THE HOLDOUTS</h1>
            <p className="text-gray-500 text-sm mt-1">compare tells · call out bot farms · share strategy</p>
          </div>
          {user?.isVerified && (
            <Button variant="solid-cyan" size="md" onClick={() => setShowComposer((v) => !v)}>
              + NEW THREAD
            </Button>
          )}
        </div>

        {showComposer && (
          <ThreadComposer onPosted={handleThreadPosted} onCancel={() => setShowComposer(false)} />
        )}

        <div className="mb-4">
          <label className="block text-xs text-gray-500 tracking-widest mb-1">ACTIVATE SCANNER</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="search threads..."
            className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
          />
          {searchQuery.trim() && (
            <p className="text-cyan-400 text-xs mt-1 tracking-widest">
              {filteredThreads.length} MATCH{filteredThreads.length !== 1 ? 'ES' : ''} FOUND
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          {(['new', 'top'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`px-4 py-1 rounded text-xs font-bold tracking-widest border transition-colors ${
                sortMode === mode
                  ? 'border-cyan-500 text-cyan-400 bg-gray-800'
                  : 'border-gray-700 text-gray-500 hover:border-gray-500'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && filteredThreads.length === 0 && (
          <div className="text-center py-12">
            {searchQuery.trim() ? (
              <p className="text-yellow-400 text-lg font-bold tracking-widest">⚠️ SIGNAL LOST</p>
            ) : (
              <p className="text-gray-500 tracking-widest">NO TRANSMISSIONS DETECTED</p>
            )}
          </div>
        )}

        {!loading && (
          <ul>
            {filteredThreads.map((thread) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                searchQuery={searchQuery}
                isReplyOpen={openReplyId === thread.id}
                onToggleReply={() => handleToggleReply(thread.id)}
                onReplyPosted={(comment) => handleReplyPosted(thread.id, comment)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

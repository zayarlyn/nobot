import QuickReply from './QuickReply';
import { timeAgo, highlightKeyword, isDeadThread } from './threadCardHelpers';

const FLAIR_DATA = {
  HUMAN:    { label: 'HUMAN-SIGHTING', color: 'var(--green)',   bg: 'rgba(77,255,176,.12)' },
  BOT:      { label: 'BOT-ALERT',      color: 'var(--cyan)',    bg: 'rgba(52,231,255,.12)' },
  META:     { label: 'META',           color: 'var(--amber)',   bg: 'rgba(255,207,77,.12)' },
  STRATEGY: { label: 'STRATEGY',       color: '#c9a6ff',        bg: 'rgba(170,130,255,.14)' },
  GLITCH:   { label: 'GLITCH',         color: 'var(--magenta)', bg: 'rgba(255,61,127,.12)' },
} as const;

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

interface ThreadCardProps {
  thread: Thread;
  searchQuery: string;
  isReplyOpen: boolean;
  onToggleReply: () => void;
  onReplyPosted: (comment: PreviewComment) => void;
}

export default function ThreadCard({ thread, searchQuery, isReplyOpen, onToggleReply, onReplyPosted }: ThreadCardProps) {
  const dead = isDeadThread(thread.lastActivityAt);
  const flair = FLAIR_DATA[thread.flair];
  const voteClass = thread.voteTotal > 0 ? 'pos' : thread.voteTotal < 0 ? 'neg' : '';

  return (
    <div className={`thread${dead ? ' dead' : ''}`}>
      <div className="vote-rail">
        <button className="vbtn up">▲</button>
        <div className={`vcount ${voteClass}`}>{thread.voteTotal}</div>
        <button className="vbtn down">▼</button>
      </div>

      <div className="thread-main">
        <div className="thread-top">
          <span className="flair-badge" style={{ color: flair.color, background: flair.bg }}>
            {flair.label}
          </span>
          <span className="av-mini">{thread.author.username[0].toUpperCase()}</span>
          <span className="au">@{thread.author.username}</span>
          <span>· {timeAgo(thread.createdAt)}</span>
        </div>

        <div className="thread-title">
          {highlightKeyword(thread.title, searchQuery)}
        </div>

        {thread.body && (
          <div className="thread-body">{thread.body}</div>
        )}

        <div className="thread-actions">
          <button className="tact" onClick={onToggleReply}>
            💬 {thread.commentCount} {thread.commentCount === 1 ? 'comment' : 'comments'}
          </button>
          <div className="thread-timestamps">
            <span>POSTED {timeAgo(thread.createdAt)}</span>
            <span>LAST ACTIVITY {timeAgo(thread.lastActivityAt)}</span>
          </div>
        </div>

        {isReplyOpen && (
          <div className="reply-panel">
            {thread.previewComments.map((c) => (
              <div key={c.id} className="preview-comment">
                <div>
                  <div className="chead">
                    <span className="av-mini">{c.author.username[0].toUpperCase()}</span>
                    <span className="cau">@{c.author.username}</span>
                    <span>· {timeAgo(c.createdAt)}</span>
                  </div>
                  <div className="ctext">{c.body}</div>
                </div>
              </div>
            ))}
            <QuickReply threadId={thread.id} onPosted={onReplyPosted} />
          </div>
        )}
      </div>
    </div>
  );
}

import Badge from '../../../common/components/Badge';
import QuickReply from './QuickReply';
import { timeAgo, highlightKeyword, isDeadThread } from './threadCardHelpers';

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

  const voteColor =
    thread.voteTotal > 0 ? 'text-green-400' :
    thread.voteTotal < 0 ? 'text-pink-500' :
    'text-gray-500';

  return (
    <li className={`border border-gray-700 rounded-lg p-4 mb-3 bg-gray-900 transition-opacity ${dead ? 'opacity-[0.65]' : ''}`}>
      <div className="flex items-start gap-3 mb-2">
        <span className={`text-sm font-bold ${voteColor}`}>
          ▲ {thread.voteTotal > 0 ? '+' : ''}{thread.voteTotal}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={thread.flair} />
            <span className="text-gray-400 text-xs">@{thread.author.username}</span>
          </div>
          <span className="text-gray-100 font-bold text-base leading-snug">
            {highlightKeyword(thread.title, searchQuery)}
          </span>
          {thread.body && (
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{thread.body}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
        <button
          onClick={onToggleReply}
          className="hover:text-cyan-400 transition-colors"
        >
          💬 {thread.commentCount} comment{thread.commentCount !== 1 ? 's' : ''}
        </button>
        <span>POSTED {timeAgo(thread.createdAt)}</span>
        <span>LAST ACTIVITY {timeAgo(thread.lastActivityAt)}</span>
      </div>

      {isReplyOpen && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          {thread.previewComments.length > 0 && (
            <ul className="mb-3 flex flex-col gap-2">
              {thread.previewComments.map((c) => (
                <li key={c.id} className="ml-4 pl-3 border-l border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="text-cyan-400 font-bold">@{c.author.username}</span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{c.body}</p>
                </li>
              ))}
            </ul>
          )}
          <QuickReply threadId={thread.id} onPosted={onReplyPosted} />
        </div>
      )}
    </li>
  );
}

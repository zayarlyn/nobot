import { useState } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useAuth } from '../../auth/hooks/useAuth';

interface PreviewComment {
  id: number;
  body: string;
  createdAt: string;
  author: { id: number; username: string };
  parentId: number | null;
}

interface QuickReplyProps {
  threadId: number;
  onPosted: (comment: PreviewComment) => void;
}

export default function QuickReply({ threadId, onPosted }: QuickReplyProps) {
  const { createComment } = useDiscussion();
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return <p className="quick-reply-gate">LOGIN TO REPLY</p>;
  }

  if (!user.isVerified) {
    return <p className="quick-reply-gate">COMPLETE THE GAME TO POST</p>;
  }

  async function handleSubmit() {
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const comment = await createComment(threadId, { body: body.trim() });
      onPosted(comment);
      setBody('');
    } catch {
      setError('TRANSMISSION FAILED. TRY AGAIN.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="quick-reply-form">
      <textarea
        className="inp"
        rows={3}
        placeholder="Add to the thread…"
        maxLength={600}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
      />
      {error && <p className="quick-reply-err">{error}</p>}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn cyan" onClick={handleSubmit} disabled={submitting || !body.trim()}>
          {submitting ? 'SENDING…' : '▸ COMMENT'}
        </button>
      </div>
    </div>
  );
}

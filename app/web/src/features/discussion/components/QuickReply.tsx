import { useState } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useAuth } from '../../auth/hooks/useAuth';
import Button from '../../../common/components/Button';

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
    return <p className="text-gray-500 text-sm mt-2">LOGIN TO REPLY</p>;
  }

  if (!user.isVerified) {
    return <p className="text-yellow-500 text-sm mt-2">COMPLETE THE GAME TO POST</p>;
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
    <div className="mt-3 flex flex-col gap-2">
      <textarea
        className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded p-2 text-sm resize-none focus:outline-none focus:border-cyan-500"
        rows={3}
        placeholder="TYPE YOUR TRANSMISSION..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
      />
      {error && <p className="text-pink-500 text-xs">{error}</p>}
      <div className="flex justify-end">
        <Button variant="solid-green" size="md" onClick={handleSubmit} disabled={submitting || !body.trim()}>
          {submitting ? 'SENDING...' : 'POST'}
        </Button>
      </div>
    </div>
  );
}

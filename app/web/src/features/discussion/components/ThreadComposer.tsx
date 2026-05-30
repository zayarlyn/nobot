import { useState } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import Button from '../../../common/components/Button';

const FLAIRS = ['HUMAN', 'BOT', 'META', 'STRATEGY', 'GLITCH'] as const;
type Flair = typeof FLAIRS[number];

const FLAIR_STYLE: Record<Flair, string> = {
  HUMAN:    'border-green-500 text-green-400',
  BOT:      'border-pink-500 text-pink-400',
  META:     'border-cyan-500 text-cyan-400',
  STRATEGY: 'border-yellow-500 text-yellow-400',
  GLITCH:   'border-purple-500 text-purple-400',
};

interface ThreadComposerProps {
  onPosted: (thread: any) => void;
  onCancel: () => void;
}

export default function ThreadComposer({ onPosted, onCancel }: ThreadComposerProps) {
  const { createThread } = useDiscussion();
  const [flair, setFlair] = useState<Flair>('HUMAN');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const thread = await createThread({ flair, title: title.trim(), body: body.trim() || undefined });
      onPosted(thread);
    } catch {
      setError('TRANSMISSION FAILED');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-4 flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {FLAIRS.map((f) => (
          <button
            key={f}
            onClick={() => setFlair(f)}
            className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
              flair === f
                ? `${FLAIR_STYLE[f]} bg-gray-800`
                : 'border-gray-600 text-gray-500 hover:border-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <input
        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded p-2 text-sm focus:outline-none focus:border-cyan-500"
        placeholder="make the catch obvious"
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={submitting}
      />
      <textarea
        className="w-full bg-gray-800 border border-gray-700 text-gray-200 rounded p-2 text-sm resize-none focus:outline-none focus:border-cyan-500"
        placeholder="lay out the evidence"
        rows={4}
        maxLength={600}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
      />
      {error && <p className="text-pink-500 text-xs">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="md" onClick={onCancel} disabled={submitting}>CANCEL</Button>
        <Button variant="solid-cyan" size="md" onClick={handleSubmit} disabled={submitting || !title.trim()}>
          {submitting ? 'SENDING...' : 'POST'}
        </Button>
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useDiscussion } from '../hooks/useDiscussion';
import { useAuth } from '../../auth/hooks/useAuth';

const FLAIRS = [
  { key: 'HUMAN',    label: 'HUMAN-SIGHTING', color: 'var(--green)' },
  { key: 'BOT',      label: 'BOT-ALERT',      color: 'var(--cyan)' },
  { key: 'META',     label: 'META',           color: 'var(--amber)' },
  { key: 'STRATEGY', label: 'STRATEGY',       color: '#c9a6ff' },
  { key: 'GLITCH',   label: 'GLITCH',         color: 'var(--magenta)' },
] as const;

type FlairKey = typeof FLAIRS[number]['key'];

interface ThreadComposerProps {
  onPosted: (thread: any) => void;
}

export default function ThreadComposer({ onPosted }: ThreadComposerProps) {
  const { createThread } = useDiscussion();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [flair, setFlair] = useState<FlairKey>('META');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => titleRef.current?.focus(), 0);
  }

  function handleCancel() {
    setOpen(false);
    setError('');
  }

  async function handleSubmit() {
    if (!title.trim()) { setError('Needs a title.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const thread = await createThread({ flair, title: title.trim(), body: body.trim() || undefined });
      onPosted(thread);
      setTitle(''); setBody(''); setOpen(false);
    } catch {
      setError('TRANSMISSION FAILED');
    } finally {
      setSubmitting(false);
    }
  }

  const initial = user ? user.username[0].toUpperCase() : '?';
  const username = user ? user.username : 'guest';

  return (
    <div className={`composer${open ? ' open' : ''}`}>
      <div className="comp-collapsed" onClick={handleOpen}>
        <div className="avatar sm">{initial}</div>
        <div className="ph">Drop a tell, a sighting, a theory</div>
      </div>
      <div className="comp-body">
        <input
          ref={titleRef}
          className="inp"
          placeholder="Title — make the catch obvious"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        <textarea
          className="inp"
          rows={3}
          placeholder="Lay out the evidence…"
          maxLength={600}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={submitting}
        />
        <div className="flair-pick">
          {FLAIRS.map((f) => (
            <button
              key={f.key}
              className={`flair-btn${flair === f.key ? ' on' : ''}`}
              style={flair === f.key ? { background: f.color } : {}}
              onClick={() => setFlair(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="comp-err">{error}</div>
        <div className="comp-row">
          <div style={{ fontSize: 11, letterSpacing: '.1em', color: 'var(--ink-faint)' }}>
            POSTING AS <b style={{ color: 'var(--ink)' }}>@{username}</b>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn ghost" onClick={handleCancel} disabled={submitting}>CANCEL</button>
            <button className="btn solid-cyan" onClick={handleSubmit} disabled={submitting || !title.trim()}>▸ POST</button>
          </div>
        </div>
      </div>
    </div>
  );
}

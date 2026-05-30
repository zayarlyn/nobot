import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../auth/hooks/useAuth';
import { useContribute } from '../hooks/useContribute';
import Avatar from '../../../common/components/Avatar';
import Button from '../../../common/components/Button';
import EmptyState from '../../../common/components/EmptyState';

const TOPICS = ['News', 'Sports', 'Politics', 'Pop Culture'] as const;
const MAX_BODY = 280;

interface Submission {
  id: number;
  kind: string;
  handle: string;
  body?: string;
  topic: string;
  createdAt: string;
}

export default function ContributePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { submitPost, getPendingPosts, deletePost } = useContribute();

  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [body, setBody] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: '/login' });
  }, [user, navigate]);

  const name = user?.username ?? '';
  const handle = '@' + name.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const avatar = name ? name[0].toUpperCase() : '?';

  async function fetchSubmissions() {
    try {
      const all = await getPendingPosts();
      const mine = all.filter((p) => p.handle === handle);
      mine.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSubmissions(mine);
    } catch {
      // not logged in — leave list empty
    }
  }

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  async function handleSubmit() {
    if (!body.trim()) {
      setError('Add the post body.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await submitPost({
        kind: 'human',
        name,
        handle,
        avatar,
        body: body.trim(),
        topic,
        tells: [],
      });
      setBody('');
      await fetchSubmissions();
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    await deletePost(id);
    await fetchSubmissions();
  }

  if (!user) return null;

  return (
    <>
      <div className="cb-head">
          <div className="eyebrow neon-green">CITIZEN INTELLIGENCE · TRAINING DATA</div>
          <h1 className="cb-title glitch" data-text="FEED THE AUDIT">FEED THE AUDIT</h1>
          <p className="cb-sub">
            You are one of the last verified humans on this network. Keep the feed alive — add your
            voice. Every post you contribute gets planted in the server plaza for others to defend.
          </p>
        </div>

        <div className="cb-grid">
          {/* FORM */}
          <div className="card">
            <div className="field">
              <label>Topic</label>
              <select
                className="inp"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Post body</label>
              <textarea
                className="inp"
                rows={4}
                maxLength={MAX_BODY}
                placeholder="Paste or write the post exactly as it appeared…"
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                  if (error) setError('');
                }}
              />
              <div className="charcount">{body.length}/{MAX_BODY}</div>
            </div>

            <div className="err">{error}</div>

            <div className="form-actions">
              <Button variant="solid-green" onClick={handleSubmit} disabled={submitting}>
                ▸ PLANT IN THE FEED
              </Button>
              <Button
                onClick={() => {
                  setBody('');
                  setError('');
                }}
              >
                RESET
              </Button>
            </div>
          </div>

          {/* PREVIEW RAIL */}
          <aside className="rail">
            <div>
              <div className="eyebrow">LIVE PREVIEW · AS SEEN IN-GAME</div>
            </div>

            <div className="post-card">
              <div className="post-head">
                <Avatar initial={avatar} size="md" />
                <div className="post-meta">
                  <div className="post-name">{name}</div>
                  <div className="post-handle">{handle}</div>
                </div>
              </div>
              <div
                className="post-body"
                style={{ color: body.trim() ? undefined : 'var(--ink-faint)' }}
              >
                {body.trim() || 'Your post body will appear here…'}
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: '8px' }}>
                YOUR SUBMISSIONS · {submissions.length}
              </div>
              <div className="subs">
                {submissions.length === 0 ? (
                  <EmptyState message="No submissions yet. The feed only has the default population." />
                ) : (
                  submissions.map((s) => (
                    <div key={s.id} className="sub-row">
                      <span className="sub-kind human">HUMAN</span>
                      <div className="sub-body">
                        <div className="t">{s.body ?? '[no body]'}</div>
                        <div className="m">{s.handle} · {s.topic}</div>
                      </div>
                      <button
                        className="del-btn"
                        title="Remove"
                        onClick={() => handleDelete(s.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../../auth/hooks/useAuth';
import { initEngine } from '../engine';
import type { GameStats } from '../engine';
import type { MonitorPost } from '../world';

interface ApiPost {
  id: number;
  kind: string;
  name: string;
  handle: string;
  avatar: string;
  body?: string;
  imageUrl?: string;
  topic: string;
  tells: string;
}

export default function GamePage() {
  const { getPosts, saveGame } = useGame();
  const { authorize, refreshUser, user } = useAuth();
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const pendingStats = useRef<GameStats | null>(null);
  const loadedPosts = useRef<MonitorPost[]>([]);
  const gateNotice = new URLSearchParams(window.location.search).get('gate') === 'discuss';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // Boot engine immediately so intro + canvas render right away.
    // Posts load in background; engine reads them on game start.
    const cleanup = initEngine(
      () => loadedPosts.current,
      (stats) => {
        pendingStats.current = stats;
        if (user) saveGame(stats).catch(() => {});
      },
      () => setShowAuth(true),
    );

    getPosts()
      .then((raw: ApiPost[]) => {
        if (!Array.isArray(raw)) return;
        loadedPosts.current = raw.map((p) => ({
          kind: p.kind as 'human' | 'ai',
          name: p.name,
          handle: p.handle,
          av: p.avatar,
          body: p.body,
          imageUrl: p.imageUrl,
          topic: p.topic,
          tells: (() => {
            try {
              return JSON.parse(p.tells);
            } catch {
              return [];
            }
          })(),
        }));
      })
      .catch(() => {}); // posts failing is non-fatal; game runs with empty pool

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authUsername.trim()) {
      setAuthError('Enter a username.');
      return;
    }
    if (!authPassword) {
      setAuthError('Enter a password.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      await authorize(authUsername.trim(), authPassword);
      if (pendingStats.current) {
        await saveGame(pendingStats.current).catch(() => {});
      }
      await refreshUser();
      navigate({ to: '/discuss' });
    } catch (err: unknown) {
      const axErr = err as { response?: { status?: number; data?: { message?: string } } };
      setAuthError(axErr?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <>
      <div className="game-stage">
        {/* STAGE */}
        <div className="stage-wrap">
          <canvas id="game" width={960} height={600}></canvas>
          <div className="controls-hint">
            WASD / ARROWS — MOVE
            <br />E — SCAN
          </div>
          <button id="scanBtn" className="scan-btn">
            ⌖ SCAN
          </button>
          <div id="correctPopup" className="correct-popup">
            <div className="cp-verdict">—</div>
            <div className="cp-delta">—</div>
          </div>
          <div className="controls">
            <div className="dpad">
              <button className="dpad-btn up">▲</button>
              <button className="dpad-btn left">◀</button>
              <button className="dpad-btn right">▶</button>
              <button className="dpad-btn down">▼</button>
            </div>
            <button className="act-btn">SCAN</button>
          </div>
        </div>

        {/* BOTTOM HUD */}
        <footer className="game-hud-bottom">
          <div className="hud-meter">
            <div className="lbl">
              <span>Integrity</span>
              <span id="hudIntegrityV">70%</span>
            </div>
            <div className="meter-track">
              <div id="hudIntegrity" className="meter-fill good" style={{ width: '70%' }} />
            </div>
          </div>
          <div className="hud-sep" />
          <div className="hud-pill">
            <div className="k">Streak</div>
            <div className="v neon-green" id="hudStreak">
              0
            </div>
          </div>
          <div className="hud-pill">
            <div className="k">Audited</div>
            <div className="v" id="hudProcessed">
              0/10
            </div>
          </div>
        </footer>

        {/* INTRO */}
        <div className="overlay" id="intro">
          <div className="gpanel wide">
            <div className="eyebrow">HUMAN VERIFICATION PROTOCOL</div>
            {gateNotice && (
              <div style={{ fontSize: 12, letterSpacing: '.1em', color: 'var(--magenta)', marginBottom: 6 }}>
                ⚠ ACCESS DENIED — verify your humanity to enter the Discussion forum.
              </div>
            )}
            <div className="bigverdict glitch" data-text="NOBOT">
              NOBOT
            </div>
            <p className="muted" style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              A humans-only group wants proof you're real.{' '}
              <span className="neon-cyan">Sort the posts. Spare the humans. Purge the bots.</span> A real human can
              smell a bot. A bot cannot.
            </p>
            <div className="row" style={{ gap: 18 }}>
              <div className="eyebrow neon-green" style={{ flex: 1, textAlign: 'center' }}>
                ◉ SPARE — HUMAN
              </div>
              <div className="eyebrow neon-mag" style={{ flex: 1, textAlign: 'center' }}>
                ⬡ PURGE — BOT
              </div>
            </div>
            <button className="btn solid-green lg block" id="startBtn">
              BEGIN VERIFICATION ▸
            </button>
          </div>
        </div>

        {/* DIALOG */}
        <div className="overlay" id="dialog">
          <div className="gpanel">
            <div className="ghead" id="dlgHead">
              <div className="eyebrow">
                <span className="neon-cyan">⌖</span> SUBMITTED · <span id="dlgTopic">—</span>
              </div>
              <button className="closex" id="dlgClose">
                ✕
              </button>
            </div>
            <div className="post">
              <div className="post-head">
                <div className="avatar" id="dlgAv">
                  ?
                </div>
                <div className="post-meta">
                  <div className="name" id="dlgName">
                    —
                  </div>
                  <div className="handle" id="dlgHandle">
                    —
                  </div>
                </div>
              </div>
              <div className="post-img" id="dlgImgWrap" style={{ display: 'none' }}>
                <img id="dlgImg" alt="submitted media" />
              </div>
              <div className="post-body" id="dlgBody">
                —
              </div>
            </div>
            <div className="eyebrow" style={{ textAlign: 'center' }}>
              VERDICT?
            </div>
            <div className="verdict-row">
              <button className="btn green" id="spareBtn">
                SPARE<span className="sub">REAL HUMAN</span>
              </button>
              <button className="btn purge" id="purgeBtn">
                PURGE<span className="sub">BOT / AI</span>
              </button>
            </div>
            <button className="btn amber block" id="flagBtn">
              ⚑ FLAG AS AMBIGUOUS
              <span className="sub" style={{ marginLeft: 6 }}>
                2 LEFT
              </span>
            </button>
          </div>
        </div>

        {/* REVEAL */}
        <div className="overlay" id="reveal">
          <div className="gpanel">
            <div className="eyebrow">VERDICT LOGGED</div>
            <div className="bigverdict" id="bigVerdict">
              —
            </div>
            <div className="truth-line">
              This account was <b id="truthKind">—</b>
            </div>
            <hr className="divider" />
            <div className="eyebrow">STYLE FINGERPRINT</div>
            <div className="tells" id="tellsList"></div>
            <hr className="divider" />
            <div className="row between center">
              <div className="delta" id="revealDelta">
                —
              </div>
              <button className="btn solid-cyan" id="continueBtn">
                CONTINUE ▸
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="overlay" id="results">
          <div className="gpanel wide">
            <div className="eyebrow">VERIFICATION COMPLETE</div>
            <div className="row center" style={{ alignItems: 'flex-end', gap: 18 }}>
              <div className="bigscore neon-cyan" id="resScore">
                0
              </div>
              <div className="col" style={{ gap: 2, paddingBottom: 6 }}>
                <div className="eyebrow">ACCURACY</div>
                <div className="display" style={{ fontSize: 26 }} id="resAcc">
                  0%
                </div>
              </div>
            </div>
            <hr className="divider" />
            <div className="bigverdict" id="resVerdict">
              —
            </div>
            <p className="muted" id="resBlurb" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              —
            </p>
            <hr className="divider" />
            <div className="score-grid">
              <div className="hud-pill">
                <div className="k">Bots Terminated</div>
                <div className="v neon-cyan" id="resBots">
                  0
                </div>
              </div>
              <div className="hud-pill">
                <div className="k">Humans Saved</div>
                <div className="v neon-green" id="resSaved">
                  0
                </div>
              </div>
              <div className="hud-pill">
                <div className="k">Humans Lost</div>
                <div className="v neon-mag" id="resKilled">
                  0
                </div>
              </div>
              <div className="hud-pill">
                <div className="k">Bots Escaped</div>
                <div className="v neon-mag" id="resEscaped">
                  0
                </div>
              </div>
            </div>
            <button className="btn solid-green lg block" id="joinBtn" style={{ display: 'none' }}>
              JOIN THE FORUM ▸
            </button>
            <button className="btn ghost lg block" id="playAgainBtn">
              ▸ RETRY VERIFICATION
            </button>
          </div>
        </div>
      </div>

      {/* FX */}
      <div className="fx-scanlines"></div>
      <div className="fx-vignette"></div>

      {/* AUTH MODAL — React controlled */}
      {showAuth && (
        <div className="overlay open" style={{ zIndex: 70 }}>
          <div className="gpanel">
            <div className="eyebrow">IDENTITY VERIFICATION</div>
            <div className="bigverdict neon-green">ACCESS GRANTED</div>
            <hr className="divider" />
            <form className="col" style={{ gap: 12 }} onSubmit={handleAuthSubmit}>
              <input
                className="auth-inp"
                type="text"
                placeholder="USERNAME"
                maxLength={32}
                autoComplete="username"
                spellCheck={false}
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
              />
              <input
                className="auth-inp"
                type="password"
                placeholder="PASSWORD"
                maxLength={64}
                autoComplete="current-password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
              {authError && (
                <div style={{ fontSize: 11, letterSpacing: '.08em', color: 'var(--magenta)', minHeight: 16 }}>
                  {authError}
                </div>
              )}
              <button className="btn solid-green lg block" type="submit" disabled={authLoading}>
                {authLoading ? '...' : 'AUTHORIZE ▸'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

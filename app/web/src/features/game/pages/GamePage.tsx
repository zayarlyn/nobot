import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../../auth/hooks/useAuth';
import { initEngine } from '../engine';
import type { CoreActions, GameStats, HudData, DialogData, PopupData, RevealData, ResultsData } from '../engine';
import type { MonitorPost } from '../world';
import { W } from '../world';

interface ApiPost {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  body?: string;
  imageUrl?: string;
  topic: string;
  tells: string;
}

const DEFAULT_HUD: HudData = { integrity: 70, integrityClass: 'good', streak: 0, processed: 0, total: 0 };

export default function GamePage() {
  const { getPosts, decide, saveGame } = useGame();
  const { authorize, user } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<CoreActions | null>(null);
  const loadedPosts = useRef<MonitorPost[]>([]);
  const pendingStats = useRef<GameStats | null>(null);

  const [gameStarted, setGameStarted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [hud, setHud] = useState<HudData>(DEFAULT_HUD);
  const [dialog, setDialog] = useState<DialogData | null>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [reveal, setReveal] = useState<RevealData | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [scanPos, setScanPos] = useState<{ x: number; y: number } | null>(null);
  const [popupKey, setPopupKey] = useState(0);
  const [scoreKey, setScoreKey] = useState(0);
  const [timerFraction, setTimerFraction] = useState(1);

  useEffect(() => {
    if (!dialog) { setTimerFraction(1); return; }
    setTimerFraction(1);
    const id = setInterval(() => {
      const fraction = Math.max(0, 1 - (performance.now() - dialog.openedAt) / dialog.timeLimit);
      setTimerFraction(fraction);
    }, 100);
    return () => clearInterval(id);
  }, [dialog?.openedAt]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !stageRef.current) return;

    const { cleanup, actions } = initEngine(canvasRef.current, stageRef.current, () => loadedPosts.current, decide, {
      onHudChange: setHud,
      onDialogOpen: setDialog,
      onDialogClose: () => setDialog(null),
      onPopupShow: (d) => {
        setPopup(d);
        setPopupKey((k) => k + 1);
      },
      onPopupHide: () => setPopup(null),
      onRevealShow: setReveal,
      onRevealHide: () => setReveal(null),
      onResultsShow: (d) => {
        setResults(d);
        setScoreKey((k) => k + 1);
      },
      onResultsHide: () => setResults(null),
      onEndGame: (stats) => {
        pendingStats.current = stats;
        if (user) saveGame(stats).catch(() => {});
      },
      onJoin: () => setShowAuth(true),
      onScanPrompt: setScanPos,
    });
    actionsRef.current = actions;

    getPosts()
      .then((raw: ApiPost[]) => {
        if (!Array.isArray(raw)) return;
        loadedPosts.current = raw.map((p) => ({
          id: p.id,
          name: p.name,
          handle: p.handle,
          av: p.avatar,
          body: p.body,
          imageUrl: p.imageUrl,
          topic: p.topic,
          tells: (() => { try { return JSON.parse(p.tells); } catch { return []; } })(),
        }));
      })
      .catch(() => {});

    return cleanup;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // compute scan button / popup screen position from world coords
  function worldToScreen(wx: number, wy: number) {
    if (!canvasRef.current || !stageRef.current) return { x: 0, y: 0 };
    const cr = canvasRef.current.getBoundingClientRect();
    const wr = stageRef.current.getBoundingClientRect();
    const scale = cr.width / W;
    return { x: cr.left - wr.left + wx * scale, y: cr.top - wr.top + wy * scale };
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authUsername.trim()) { setAuthError('Enter a username.'); return; }
    if (!authPassword) { setAuthError('Enter a password.'); return; }
    setAuthLoading(true);
    setAuthError('');
    try {
      await authorize(authUsername.trim(), authPassword);
      if (pendingStats.current) await saveGame(pendingStats.current).catch(() => {});
      sessionStorage.setItem('gamePassed', '1');
      navigate({ to: '/discuss' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setAuthError(ax?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setAuthLoading(false);
    }
  }

  const scanScreen = scanPos ? worldToScreen(scanPos.x, scanPos.y) : null;
  const popupScreen = popup ? worldToScreen(popup.worldX, popup.worldY) : null;

  return (
    <>
      <div className="game-stage" ref={stageRef}>
        {/* STAGE */}
        <div className="stage-wrap">
          <canvas ref={canvasRef} id="game" width={960} height={600} />
          <div className="controls-hint">
            WASD / ARROWS — MOVE
            <br />E — SCAN
          </div>

          {/* scan affordance — React positioned */}
          {scanScreen && (
            <button
              className="scan-btn show"
              style={{ left: scanScreen.x, top: scanScreen.y }}
              onClick={() => actionsRef.current?.interact()}
            >
              ⌖ SCAN
            </button>
          )}

          {/* correct popup — React positioned */}
          {popup && popupScreen && (
            <div key={popupKey} className="correct-popup show" style={{ left: popupScreen.x, top: popupScreen.y }}>
              <div className={`cp-verdict ${popup.verdictClass}`}>{popup.verdict}</div>
              <div className={`cp-delta ${popup.deltaClass}`}>{popup.delta}</div>
            </div>
          )}

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
              <span>{hud.integrity}%</span>
            </div>
            <div className="meter-track">
              <div className={`meter-fill ${hud.integrityClass}`} style={{ width: `${hud.integrity}%` }} />
            </div>
          </div>
          <div className="hud-sep" />
          <div className="hud-pill">
            <div className="k">Streak</div>
            <div className="v neon-green">{hud.streak}</div>
          </div>
          <div className="hud-pill">
            <div className="k">Audited</div>
            <div className="v">
              {hud.processed}/{hud.total}
            </div>
          </div>
          <div className="hud-sep" />
          <div style={{ fontSize: 9, letterSpacing: '.08em', color: 'var(--ink-faint)', lineHeight: 1.4 }}>
            Music by{' '}
            <a href="https://pixabay.com/users/hitslab-47305729/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=295075" target="_blank" rel="noreferrer" style={{ color: 'var(--ink-dim)' }}>
              Ievgen Poltavskyi
            </a>{' '}
            from{' '}
            <a href="https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=295075" target="_blank" rel="noreferrer" style={{ color: 'var(--ink-dim)' }}>
              Pixabay
            </a>
          </div>
        </footer>

        {/* INTRO */}
        {!gameStarted && (
          <div className="overlay open">
            <div className="gpanel wide">
              <div className="eyebrow">HUMAN VERIFICATION PROTOCOL</div>
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
              <button
                className="btn solid-green lg block"
                onClick={() => {
                  actionsRef.current?.start();
                  setGameStarted(true);
                }}
              >
                BEGIN VERIFICATION ▸
              </button>
            </div>
          </div>
        )}

        {/* DIALOG */}
        {dialog && (
          <div className="overlay open">
            <div className="gpanel">
              <div className="ghead">
                <div className="eyebrow">
                  <span className="neon-cyan">⌖</span> SUBMITTED · <span>{dialog.topic}</span>
                  {dialog.custom && <span className="srctag">· COMMUNITY</span>}
                </div>
                <button className="closex" onClick={() => actionsRef.current?.closeDialog()}>
                  ✕
                </button>
              </div>
              <div className="post">
                <div className="post-head">
                  <div className="avatar">{dialog.av}</div>
                  <div className="post-meta">
                    <div className="name">{dialog.name}</div>
                    <div className="handle">{dialog.handle}</div>
                  </div>
                </div>
                {dialog.imageUrl && (
                  <div className="post-img">
                    <img src={dialog.imageUrl} alt="submitted media" />
                  </div>
                )}
                {dialog.body && <div className="post-body">{dialog.body}</div>}
              </div>
              <div className="timer-bar">
                <div className={`timer-fill${timerFraction < 0.25 ? ' low' : ''}`} style={{ width: `${timerFraction * 100}%` }} />
              </div>
              <div className="eyebrow" style={{ textAlign: 'center' }}>
                VERDICT?
              </div>
              <div className="verdict-row">
                <button className="btn green" onClick={() => actionsRef.current?.decide('spare')}>
                  SPARE<span className="sub">REAL HUMAN</span>
                </button>
                <button className="btn purge" onClick={() => actionsRef.current?.decide('purge')}>
                  PURGE<span className="sub">BOT / AI</span>
                </button>
              </div>
              <button
                className="btn amber block"
                disabled={dialog.flagsLeft <= 0}
                onClick={() => actionsRef.current?.decide('flag')}
              >
                ⚑ FLAG AS AMBIGUOUS
                <span className="sub" style={{ marginLeft: 6 }}>
                  {dialog.flagsLeft} LEFT
                </span>
              </button>
            </div>
          </div>
        )}

        {/* REVEAL */}
        {reveal && (
          <div className="overlay open">
            <div className="gpanel">
              <div className="eyebrow">VERDICT LOGGED</div>
              <div className={`bigverdict ${reveal.verdictClass}`}>{reveal.verdict}</div>
              <div className="truth-line">
                This account was <b className={reveal.truthClass}>{reveal.truthKind}</b>
              </div>
              <hr className="divider" />
              <div className="eyebrow">STYLE FINGERPRINT</div>
              <div className="tells">
                {reveal.tells.map((t, i) => (
                  <div key={i} className="tell">
                    <span className="b">▸</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
              <hr className="divider" />
              <div className="row between center">
                <div className={`delta ${reveal.deltaClass}`}>{reveal.delta}</div>
                <button className="btn solid-cyan" onClick={() => actionsRef.current?.continueReveal()}>
                  CONTINUE ▸
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {results && (
          <div className="overlay open">
            <div className="gpanel wide">
              <div className="eyebrow">VERIFICATION COMPLETE</div>
              <div className="row center" style={{ alignItems: 'flex-end', gap: 18 }}>
                <div key={scoreKey} className="bigscore neon-cyan glitch-burst">
                  {results.score}
                </div>
                <div className="col" style={{ gap: 2, paddingBottom: 6 }}>
                  <div className="eyebrow">ACCURACY</div>
                  <div className="display" style={{ fontSize: 26 }}>
                    {results.accuracy}
                  </div>
                </div>
              </div>
              <hr className="divider" />
              <div className={`bigverdict ${results.verdictClass}`}>{results.verdict}</div>
              <p className="muted" style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {results.blurb}
              </p>
              <hr className="divider" />
              <div className="score-grid">
                <div className="hud-pill">
                  <div className="k">Bots Terminated</div>
                  <div className="v neon-cyan">{results.purgedBots}</div>
                </div>
                <div className="hud-pill">
                  <div className="k">Humans Saved</div>
                  <div className="v neon-green">{results.savedHumans}</div>
                </div>
                <div className="hud-pill">
                  <div className="k">Humans Lost</div>
                  <div className="v neon-mag">{results.killedHumans}</div>
                </div>
                <div className="hud-pill">
                  <div className="k">Bots Escaped</div>
                  <div className="v neon-mag">{results.escapedBots}</div>
                </div>
              </div>
              {results.passed ? (
                <button className="btn solid-green lg block" onClick={() => actionsRef.current?.join()}>
                  JOIN THE FORUM ▸
                </button>
              ) : (
                <button
                  className="btn ghost lg block"
                  onClick={() => {
                    actionsRef.current?.restart();
                    setGameStarted(true);
                  }}
                >
                  ▸ RETRY VERIFICATION
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fx-scanlines" />
      <div className="fx-vignette" />

      {/* AUTH MODAL */}
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

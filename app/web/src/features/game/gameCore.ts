import {
  COLS, ROWS, TILE,
  Rack, generateRacks, buildGrid, buildPool, generateSpots,
  MonitorPost,
} from './world';
import { sounds } from './sound';

export type DecideFn = (postId: number, action: 'spare' | 'purge' | 'flag') => Promise<{
  correct: boolean | null;
  kind: 'human' | 'ai';
  tells: string[];
}>;

// ── shared types ────────────────────────────────────────────────────────────

export interface Monitor extends MonitorPost {
  x: number; y: number; r: number; bob: number;
  state: 'idle' | 'purged' | 'spared' | 'flagged';
  correct: boolean | null;
  action: string | null;
  scale: number;
  targetScale?: number;
}

export interface Particle {
  x: number; y: number; vx: number; vy: number;
  s: number; c: string; life: number; max: number;
}

export interface HudData {
  integrity: number;
  integrityClass: 'good' | 'warn' | 'bad';
  streak: number;
  processed: number;
  total: number;
}

export interface DialogData {
  av: string; name: string; handle: string;
  body?: string; imageUrl?: string;
  topic: string; custom?: boolean; flagsLeft: number;
  openedAt: number;
  timeLimit: number;
}

export interface PopupData {
  verdict: string; verdictClass: string;
  delta: string; deltaClass: string;
  worldX: number; worldY: number;
}

export interface RevealData {
  verdict: string; verdictClass: string;
  truthKind: string; truthClass: string;
  delta: string; deltaClass: string;
  tells: string[];
}

export interface ResultsData {
  score: number; accuracy: string;
  verdict: string; verdictClass: string; blurb: string;
  purgedBots: number; savedHumans: number;
  killedHumans: number; escapedBots: number;
  passed: boolean;
}

export interface GameStats {
  score: number; accuracy: number; verdict: string; streak: number;
  purgedBots: number; savedHumans: number; killedHumans: number; escapedBots: number;
}

export interface RenderState {
  player: { x: number; y: number; dir: { x: number; y: number }; anim: number };
  monitors: Monitor[];
  particles: Particle[];
  racks: Rack[];
  nearNpc: boolean;
  phase: string;
}

export interface CoreCallbacks {
  onHudChange: (data: HudData) => void;
  onDialogOpen: (data: DialogData) => void;
  onDialogClose: () => void;
  onPopupShow: (data: PopupData) => void;
  onPopupHide: () => void;
  onRevealShow: (data: RevealData) => void;
  onRevealHide: () => void;
  onResultsShow: (data: ResultsData) => void;
  onResultsHide: () => void;
  onEndGame: (stats: GameStats) => void;
  onJoin: () => void;
  onScanPrompt: (pos: { x: number; y: number } | null) => void;
}

// ── core ────────────────────────────────────────────────────────────────────

const MAX_MONITORS = 10;

interface GameState {
  integrity: number; streak: number; best: number; score: number;
  correct: number; wrong: number;
  purgedBots: number; killedHumans: number; escapedBots: number; savedHumans: number;
  flags: number; processed: number; total: number;
}

export function createGameCore(getPosts: () => MonitorPost[], decideFn: DecideFn, cb: CoreCallbacks) {
  let racks: Rack[] = [];
  let grid: number[][] = [];
  let phase = 'intro';
  let monitors: Monitor[] = [];
  let particles: Particle[] = [];
  let current: Monitor | null = null;
  let game: GameState | null = null;
  let popupTimer: ReturnType<typeof setTimeout> | null = null;
  let dialogTimeout: ReturnType<typeof setTimeout> | null = null;
  const DIALOG_LIMIT = 15_000;

  const keys: Record<string, boolean> = {};
  const player = { x: 0, y: 0, r: 13, dir: { x: 0, y: 1 }, anim: 0 };

  function shuffle<T>(a: T[]): T[] {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildGame() {
    racks = generateRacks();
    grid = buildGrid(racks);
    const { subs, defaults } = buildPool(getPosts());
    const pool = shuffle([...subs, ...shuffle(defaults)]).slice(0, MAX_MONITORS);
    const spots = generateSpots(pool.length, grid);
    monitors = pool.map((p, i) => ({
      ...p,
      x: (spots[i][0] + 0.5) * TILE,
      y: (spots[i][1] + 0.5) * TILE,
      r: 13, bob: Math.random() * Math.PI * 2,
      state: 'idle' as const, correct: null, action: null, scale: 1,
    }));
    do {
      player.x = (1 + Math.random() * (COLS - 2)) * TILE;
      player.y = (1 + Math.random() * (ROWS - 2)) * TILE;
    } while (grid[Math.floor(player.y / TILE)]?.[Math.floor(player.x / TILE)] === 1);
    player.dir = { x: 0, y: -1 };
    particles = [];
    game = {
      integrity: 70, streak: 0, best: 0, score: 0, correct: 0, wrong: 0,
      purgedBots: 0, killedHumans: 0, escapedBots: 0, savedHumans: 0,
      flags: 2, processed: 0, total: monitors.length,
    };
    current = null;
    emitHud();
  }

  function emitHud() {
    if (!game) return;
    const ig = game.integrity;
    cb.onHudChange({
      integrity: ig,
      integrityClass: ig > 60 ? 'good' : ig > 30 ? 'warn' : 'bad',
      streak: game.streak,
      processed: game.processed,
      total: game.total,
    });
  }

  // collision
  function solidAt(px: number, py: number) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return true;
    return grid[ty][tx] === 1;
  }
  function hitsWall(px: number, py: number, r: number) {
    return solidAt(px - r, py - r) || solidAt(px + r, py - r) ||
           solidAt(px - r, py + r) || solidAt(px + r, py + r);
  }
  function hitsNpc(px: number, py: number, r: number) {
    for (const n of monitors) {
      if (n.state !== 'idle') continue;
      const dx = px - n.x, dy = py - n.y, rr = r + n.r + 2;
      if (dx * dx + dy * dy < rr * rr) return true;
    }
    return false;
  }
  function moveAxis(dx: number, dy: number) {
    const nx = player.x + dx, ny = player.y + dy;
    if (dx && !hitsWall(nx, player.y, player.r) && !hitsNpc(nx, player.y, player.r)) player.x = nx;
    if (dy && !hitsWall(player.x, ny, player.r) && !hitsNpc(player.x, ny, player.r)) player.y = ny;
  }

  function nearestNpc(): Monitor | null {
    let best: Monitor | null = null, bd = 1e9;
    for (const n of monitors) {
      if (n.state !== 'idle') continue;
      const dx = player.x - n.x, dy = player.y - n.y, d = Math.hypot(dx, dy);
      if (d < 64 && d < bd) { bd = d; best = n; }
    }
    return best;
  }

  function burst(x: number, y: number, color: string) {
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, sp = 0.04 + Math.random() * 0.12;
      particles.push({
        x, y: y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        s: 2 + Math.random() * 3, c: color, life: 400 + Math.random() * 400, max: 800,
      });
    }
  }

  function endGame(dead: boolean) {
    phase = 'results';
    const g = game!;
    const acc = g.correct + g.wrong > 0 ? Math.round((g.correct / (g.correct + g.wrong)) * 100) : 0;
    let verdict: string, verdictClass: string, blurb: string;
    sounds.stopMusic();
    if (dead) {
      verdict = 'ACCESS DENIED'; verdictClass = 'neon-mag'; sounds.lose();
      blurb = 'Your integrity collapsed. The group flagged your account as synthetic. You are not welcome here.';
    } else if (acc >= 85) {
      verdict = 'ACCESS GRANTED'; verdictClass = 'neon-green'; sounds.win();
      blurb = 'You passed. The door opened. A real human can smell a bot — and you proved it.';
    } else if (acc >= 60) {
      verdict = 'UNDER REVIEW'; verdictClass = ''; sounds.lose();
      blurb = "Borderline. The group isn't sure about you. Too many bots slipped through undetected.";
    } else {
      verdict = 'ACCESS DENIED'; verdictClass = 'neon-mag'; sounds.lose();
      blurb = 'You failed the test. Too many bots slipped through. The group flagged your account as synthetic.';
    }
    cb.onResultsShow({
      score: g.score, accuracy: acc + '%', verdict, verdictClass, blurb,
      purgedBots: g.purgedBots, savedHumans: g.savedHumans,
      killedHumans: g.killedHumans, escapedBots: g.escapedBots,
      passed: verdict === 'ACCESS GRANTED',
    });
    cb.onEndGame({
      score: g.score, accuracy: acc, verdict, streak: g.best,
      purgedBots: g.purgedBots, savedHumans: g.savedHumans,
      killedHumans: g.killedHumans, escapedBots: g.escapedBots,
    });
  }

  function advanceAfterPopup() {
    cb.onPopupHide();
    if (game!.integrity <= 0) endGame(true);
    else if (game!.processed >= game!.total) endGame(false);
    else phase = 'explore';
    popupTimer = null;
  }

  // ── public API ─────────────────────────────────────────────────────────────

  return {
    start() { buildGame(); phase = 'explore'; sounds.startMusic(); },

    update(dt: number) {
      if (phase !== 'explore' && phase !== 'reveal') return;
      const sp = 0.19 * dt;
      let vx = 0, vy = 0;
      if (keys.up) vy -= 1; if (keys.down) vy += 1;
      if (keys.left) vx -= 1; if (keys.right) vx += 1;
      if (vx || vy) {
        const m = Math.hypot(vx, vy) || 1;
        moveAxis((vx / m) * sp, (vy / m) * sp);
        player.dir = { x: vx, y: vy }; player.anim += dt;
      }
      const near = phase === 'explore' ? nearestNpc() : null;
      cb.onScanPrompt(near ? { x: near.x, y: near.y - near.r } : null);
      particles.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.vy += 0.0008 * dt; });
      particles = particles.filter((p) => p.life > 0);
      monitors.forEach((n) => { n.bob += dt * 0.004; if (n.targetScale != null) n.scale += (n.targetScale - n.scale) * 0.12; });
    },

    interact() {
      if (phase !== 'explore') return;
      const n = nearestNpc();
      if (!n) return;
      sounds.scan();
      current = n; phase = 'dialog';
      cb.onScanPrompt(null);
      cb.onDialogOpen({ av: n.av, name: n.name, handle: n.handle, body: n.body, imageUrl: n.imageUrl, topic: n.topic, custom: n.custom, flagsLeft: game!.flags, openedAt: performance.now(), timeLimit: DIALOG_LIMIT });

      if (dialogTimeout) clearTimeout(dialogTimeout);
      dialogTimeout = setTimeout(() => {
        if (phase !== 'dialog' || !current) return;
        const timedOut = current;

        // mark on canvas as a failed choice (wrong-spared = escaped)
        timedOut.state = 'spared';
        timedOut.correct = false;
        timedOut.action = 'timeout';
        timedOut.targetScale = 1;

        game!.integrity = Math.max(0, game!.integrity - 8);
        game!.processed++;
        emitHud();
        current = null; phase = 'reveal';
        cb.onDialogClose();

        // fetch kind from server so reveals are still accurate on timeout
        decideFn(timedOut.id, 'flag').then((verdict) => {
          const kind = verdict.kind;
          if (kind === 'ai') game!.escapedBots++; else game!.killedHumans++;
          timedOut.state = 'spared'; timedOut.correct = false; timedOut.action = 'timeout';
          const tells = verdict.tells.length ? verdict.tells
            : [kind === 'ai' ? 'Community-submitted as AI — no fingerprint notes provided.' : 'Community-submitted as human — no fingerprint notes provided.'];
          cb.onRevealShow({
            verdict: 'TIME OUT', verdictClass: 'neon-mag',
            truthKind: kind === 'ai' ? 'AI / SYNTHETIC' : 'HUMAN / ORGANIC',
            truthClass: kind === 'ai' ? 'neon-cyan' : 'neon-green',
            delta: '−8 INTEGRITY', deltaClass: 'neon-mag', tells,
          });
        }).catch(() => {
          cb.onRevealShow({
            verdict: 'TIME OUT', verdictClass: 'neon-mag',
            truthKind: 'UNKNOWN', truthClass: '',
            delta: '−8 INTEGRITY', deltaClass: 'neon-mag',
            tells: ['Connection lost — could not retrieve fingerprint.'],
          });
        });
        dialogTimeout = null;
      }, DIALOG_LIMIT);
    },

    closeDialog() {
      if (dialogTimeout) { clearTimeout(dialogTimeout); dialogTimeout = null; }
      phase = 'explore'; current = null; cb.onDialogClose();
    },

    async decide(action: 'spare' | 'purge' | 'flag') {
      if (!current || !game) return;
      if (dialogTimeout) { clearTimeout(dialogTimeout); dialogTimeout = null; }
      const n = current;
      current = null;
      cb.onDialogClose();

      let correct: boolean | null = null;
      let kind: 'human' | 'ai' = 'human';
      let tells: string[] = [];
      let big = '', bigClass = '', deltaTxt = '', deltaClass = '';

      if (action === 'flag') {
        n.state = 'flagged'; n.targetScale = 1; game.flags--;
        sounds.flag();
        big = 'FLAGGED'; bigClass = ''; deltaTxt = 'NO CHANGE'; deltaClass = 'muted';
      } else {
        try {
          const verdict = await decideFn(n.id, action);
          correct = verdict.correct; kind = verdict.kind; tells = verdict.tells;
        } catch {
          // network failure — treat as wrong to avoid granting free passes
          correct = false; kind = 'ai'; tells = [];
        }
        n.correct = correct; n.action = action;
        if (action === 'purge') { n.state = 'purged'; n.targetScale = 0.82; burst(n.x, n.y, correct ? '#34e7ff' : '#ff3d7f'); }
        else { n.state = 'spared'; n.targetScale = 1; }
        if (correct) {
          sounds.correct(); if (action === 'purge') sounds.purge();
          game.correct++; game.streak++; game.best = Math.max(game.best, game.streak);
          game.score += 100 + game.streak * 10;
          game.integrity = Math.min(100, game.integrity + 6);
          if (kind === 'ai') { game.purgedBots++; big = 'BOT TERMINATED'; }
          else { game.savedHumans++; big = 'HUMAN VERIFIED'; }
          bigClass = 'neon-green'; deltaTxt = '+6 INTEGRITY'; deltaClass = 'neon-green';
        } else {
          sounds.wrong();
          game.wrong++; game.streak = 0;
          game.integrity = Math.max(0, game.integrity - 12);
          if (action === 'purge') { game.killedHumans++; big = 'HUMAN LOST'; }
          else { game.escapedBots++; big = 'BOT ESCAPED'; }
          bigClass = 'neon-mag'; deltaTxt = '−12 INTEGRITY'; deltaClass = 'neon-mag';
        }
      }
      game.processed++;
      emitHud();
      phase = 'reveal';

      if (correct) {
        cb.onPopupShow({ verdict: big, verdictClass: bigClass, delta: deltaTxt, deltaClass, worldX: n.x, worldY: n.y - 30 });
        if (popupTimer) clearTimeout(popupTimer);
        popupTimer = setTimeout(advanceAfterPopup, 1200);
      } else {
        const fallback = kind === 'ai' ? 'Community-submitted as AI — no fingerprint notes provided.' : 'Community-submitted as human — no fingerprint notes provided.';
        cb.onRevealShow({ verdict: big, verdictClass: bigClass, truthKind: kind === 'ai' ? 'AI / SYNTHETIC' : 'HUMAN / ORGANIC', truthClass: kind === 'ai' ? 'neon-cyan' : 'neon-green', delta: deltaTxt, deltaClass, tells: tells.length ? tells : [fallback] });
      }
    },

    continueReveal() {
      cb.onRevealHide();
      if (game!.integrity <= 0) endGame(true);
      else if (game!.processed >= game!.total) endGame(false);
      else phase = 'explore';
    },

    restart() { cb.onResultsHide(); buildGame(); phase = 'explore'; sounds.startMusic(); },

    join() { cb.onResultsHide(); cb.onJoin(); },

    setKey(key: string, pressed: boolean) { keys[key] = pressed; },
    getPhase: () => phase,

    getRenderState(): RenderState {
      return { player: { ...player }, monitors, particles, racks, nearNpc: !!nearestNpc(), phase };
    },

    destroy() {
      if (popupTimer) clearTimeout(popupTimer);
      if (dialogTimeout) clearTimeout(dialogTimeout);
      sounds.stopMusic();
    },
  };
}

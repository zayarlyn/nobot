import { COLS, ROWS, TILE, W, H, Rack } from './world';
import { Monitor, Particle, RenderState } from './gameCore';

const GLITCH = 0.6;

export function createRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  // convert world coords to screen coords relative to the viewport
  function worldToScreen(wx: number, wy: number) {
    const r = canvas.getBoundingClientRect();
    const scale = r.width / W;
    return { x: r.left + wx * scale, y: r.top + wy * scale };
  }

  function drawWallRect(tx: number, ty: number, w: number, h: number) {
    const x = tx * TILE, y = ty * TILE;
    ctx.fillStyle = '#0c1118'; ctx.fillRect(x, y, w * TILE, h * TILE);
    ctx.strokeStyle = 'rgba(40,53,68,0.9)'; ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w * TILE - 1, h * TILE - 1);
  }

  function drawRack(r: Rack, now: number) {
    const x = r.x * TILE, y = r.y * TILE, w = r.w * TILE, h = r.h * TILE;
    ctx.fillStyle = '#0e141c'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(52,231,255,0.18)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    for (let i = 0; i < r.h * 2; i++) {
      const ly = y + 10 + i * 16;
      if (ly > y + h - 8) break;
      ctx.fillStyle = Math.sin(now * 0.005 + i * 1.7 + r.x) > 0.2 ? '#4dffb0' : '#1d2733';
      ctx.fillRect(x + 8, ly, 6, 4);
      ctx.fillStyle = Math.sin(now * 0.007 + i + r.y) > 0 ? '#34e7ff' : '#1d2733';
      ctx.fillRect(x + 18, ly, 6, 4);
    }
  }

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawEntity(
    x: number, y: number,
    opts: { edge: string; fill: string; glow: string | null; glyph: string; alpha: number; scale: number },
  ) {
    const { edge, fill, glow, glyph, alpha, scale } = opts;
    ctx.save();
    ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0c1118'; ctx.strokeStyle = edge; ctx.lineWidth = 1.5;
    roundRect(-7, 2, 14, 12, 3); ctx.fill(); ctx.stroke();
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 14; }
    ctx.fillStyle = fill; ctx.strokeStyle = edge; ctx.lineWidth = 2;
    roundRect(-13, -16, 26, 22, 5); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = edge; ctx.font = "700 13px 'Space Mono', monospace";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(glyph, 0, -5);
    ctx.restore();
  }

  function drawPlayer(state: RenderState, now: number) {
    const { player, nearNpc } = state;
    drawEntity(player.x, player.y, {
      edge: '#4dffb0', fill: '#0a1813', glow: 'rgba(77,255,176,0.6)',
      glyph: '◢', alpha: 1, scale: 1 + Math.sin(now * 0.006) * 0.02,
    });
    ctx.save();
    ctx.translate(player.x + player.dir.x * 18, player.y + player.dir.y * 18);
    ctx.fillStyle = 'rgba(77,255,176,0.7)'; ctx.fillRect(-2, -2, 4, 4);
    ctx.restore();
    if (nearNpc) {
      ctx.strokeStyle = 'rgba(52,231,255,0.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(player.x, player.y, 26 + Math.sin(now * 0.01) * 2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawNpc(n: Monitor, now: number) {
    const yb = n.y + Math.sin(n.bob) * (n.state === 'idle' ? 2 : 0);
    let opts: { edge: string; fill: string; glow: string | null; glyph: string; alpha: number; scale: number };
    if (n.state === 'idle') {
      opts = { edge: '#8d9aa6', fill: '#11161d', glow: null, glyph: n.av, alpha: 1, scale: n.scale };
    } else if (n.state === 'purged') {
      opts = { edge: n.correct ? '#34e7ff' : '#ff3d7f', fill: '#0a0d12', glow: n.correct ? null : 'rgba(255,61,127,0.4)', glyph: '×', alpha: 0.5, scale: n.scale };
    } else if (n.state === 'spared') {
      opts = { edge: n.correct ? '#4dffb0' : '#ff3d7f', fill: '#0a0d12', glow: null, glyph: n.correct ? '✓' : '!', alpha: 0.65, scale: n.scale };
    } else {
      opts = { edge: '#ffcf4d', fill: '#0a0d12', glow: null, glyph: '?', alpha: 0.65, scale: n.scale };
    }
    drawEntity(n.x, yb, opts);
    if (n.state === 'idle') {
      ctx.save(); ctx.globalAlpha = 0.8;
      ctx.font = "10px 'JetBrains Mono', monospace"; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(141,154,166,0.9)'; ctx.fillText(n.handle, n.x, yb - 24);
      ctx.restore();
    }
  }

  function drawParticles(particles: Particle[]) {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.c; ctx.fillRect(p.x, p.y, p.s, p.s);
    });
    ctx.globalAlpha = 1;
  }

  return {
    worldToScreen,

    render(state: RenderState, now: number) {
      resize();
      ctx.save();
      ctx.scale(canvas.width / W, canvas.height / H);
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#070a0e'; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(52,231,255,0.05)'; ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * TILE, 0); ctx.lineTo(x * TILE, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * TILE); ctx.lineTo(W, y * TILE); ctx.stroke(); }

      drawWallRect(0, 0, COLS, 1); drawWallRect(0, ROWS - 1, COLS, 1);
      drawWallRect(0, 0, 1, ROWS); drawWallRect(COLS - 1, 0, 1, ROWS);
      state.racks.forEach((r) => drawRack(r, now));

      type Ent = { isPlayer: true; y: number } | { isPlayer: false; y: number; monitor: Monitor };
      const ents: Ent[] = (
        [{ isPlayer: true as const, y: state.player.y },
         ...state.monitors.map((n) => ({ isPlayer: false as const, y: n.y, monitor: n }))]
      ).sort((a, b) => a.y - b.y);
      ents.forEach((e) => {
        if (e.isPlayer) drawPlayer(state, now);
        else drawNpc(e.monitor, now);
      });

      drawParticles(state.particles);

      if (GLITCH > 0.05) {
        const sweep = ((now * 0.04) % (H + 80)) - 40;
        const grad = ctx.createLinearGradient(0, sweep - 30, 0, sweep + 30);
        grad.addColorStop(0, 'rgba(52,231,255,0)');
        grad.addColorStop(0.5, `rgba(52,231,255,${0.06 * GLITCH})`);
        grad.addColorStop(1, 'rgba(52,231,255,0)');
        ctx.fillStyle = grad; ctx.fillRect(0, sweep - 30, W, 60);
      }
      ctx.restore();
    },
  };
}

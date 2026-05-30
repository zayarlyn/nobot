import { MonitorPost } from './world';
import { createGameCore, CoreCallbacks, DecideFn, GameStats } from './gameCore';
import { createRenderer } from './renderer';
import { createInputHandler } from './inputHandler';

export type { GameStats, CoreCallbacks };
export type { HudData, DialogData, PopupData, RevealData, ResultsData } from './gameCore';

export interface CoreActions {
  start(): void;
  interact(): void;
  decide(action: 'spare' | 'purge' | 'flag'): void;
  closeDialog(): void;
  continueReveal(): void;
  restart(): void;
  join(): void;
}

export function initEngine(
  canvas: HTMLCanvasElement,
  wrap: Element,
  getPosts: () => MonitorPost[],
  decideFn: DecideFn,
  callbacks: CoreCallbacks,
): { cleanup: () => void; actions: CoreActions } {
  const core = createGameCore(getPosts, decideFn, callbacks);
  const renderer = createRenderer(canvas);
  const input = createInputHandler(core, wrap);

  let rafId = 0;
  let last = performance.now();
  function loop(now: number) {
    const dt = Math.min(33, now - last); last = now;
    core.update(dt);
    renderer.render(core.getRenderState(), now);
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  return {
    cleanup() {
      cancelAnimationFrame(rafId);
      input.destroy();
      core.destroy();
    },
    actions: {
      start:          () => core.start(),
      interact:       () => core.interact(),
      decide:         (a) => core.decide(a),
      closeDialog:    () => core.closeDialog(),
      continueReveal: () => core.continueReveal(),
      restart:        () => core.restart(),
      join:           () => core.join(),
    },
  };
}

const MOVE: Record<string, string> = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
};

interface CoreHandle {
  getPhase(): string;
  interact(): void;
  closeDialog(): void;
  setKey(key: string, pressed: boolean): void;
}

export function createInputHandler(core: CoreHandle, wrap: Element) {
  function onKeyDown(e: KeyboardEvent) {
    const tag = (document.activeElement?.tagName ?? '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    if (MOVE[e.code]) { core.setKey(MOVE[e.code], true); e.preventDefault(); }
    if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && core.getPhase() === 'explore') {
      core.interact(); e.preventDefault();
    }
    if (e.code === 'Escape' && core.getPhase() === 'dialog') core.closeDialog();
  }
  function onKeyUp(e: KeyboardEvent) { if (MOVE[e.code]) core.setKey(MOVE[e.code], false); }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  function bindHold(el: Element | null, dir: string) {
    if (!el) return;
    const on = (ev: Event) => { ev.preventDefault(); core.setKey(dir, true); };
    const off = (ev: Event) => { ev.preventDefault(); core.setKey(dir, false); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }
  bindHold(wrap.querySelector('.dpad .up'), 'up');
  bindHold(wrap.querySelector('.dpad .down'), 'down');
  bindHold(wrap.querySelector('.dpad .left'), 'left');
  bindHold(wrap.querySelector('.dpad .right'), 'right');

  const actBtn = wrap.querySelector('.act-btn');
  if (actBtn) actBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (core.getPhase() === 'explore') core.interact(); });

  return {
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

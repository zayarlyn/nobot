let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function play(fn: (c: AudioContext, t: number) => void) {
  try {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    fn(c, c.currentTime);
  } catch {
    /* audio blocked or unsupported */
  }
}

function tone(
  c: AudioContext,
  t: number,
  freqStart: number,
  freqEnd: number,
  type: OscillatorType,
  attack: number,
  sustain: number,
  release: number,
  peak = 0.22,
) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t);
  osc.frequency.linearRampToValueAtTime(freqEnd, t + attack + sustain + release);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(peak, t + attack);
  gain.gain.setValueAtTime(peak, t + attack + sustain);
  gain.gain.linearRampToValueAtTime(0, t + attack + sustain + release);
  osc.start(t);
  osc.stop(t + attack + sustain + release + 0.01);
}

// ── individual sounds ───────────────────────────────────────────────────────

// Short upward ping when scanner opens on a monitor
function scan() {
  play((c, t) => {
    tone(c, t, 700, 1100, 'sine', 0.008, 0.04, 0.07, 0.18);
  });
}

// Two ascending sine blips — correct decision
function correct() {
  play((c, t) => {
    tone(c, t, 440, 440, 'sine', 0.008, 0.07, 0.1, 0.22);
    tone(c, t + 0.1, 660, 660, 'sine', 0.008, 0.07, 0.12, 0.22);
  });
}

// Harsh descending sawtooth buzz — wrong decision
function wrong() {
  play((c, t) => {
    tone(c, t, 380, 70, 'sawtooth', 0.01, 0.12, 0.22, 0.22);
    tone(c, t, 190, 50, 'sine', 0.01, 0.14, 0.22, 0.1);
  });
}

// Flat neutral blip — flagged as ambiguous
function flag() {
  play((c, t) => {
    tone(c, t, 560, 520, 'sine', 0.005, 0.03, 0.07, 0.14);
  });
}

// Sharp square-wave zap — bot purged (particle burst)
function purge() {
  play((c, t) => {
    tone(c, t, 950, 180, 'square', 0.005, 0.03, 0.1, 0.16);
    tone(c, t, 600, 100, 'sawtooth', 0.005, 0.04, 0.12, 0.1);
  });
}

// Ascending four-note arpeggio — ACCESS GRANTED
function win() {
  play((c, t) => {
    [330, 440, 550, 880].forEach((f, i) => {
      tone(c, t + i * 0.11, f, f, 'sine', 0.01, 0.1, 0.18, 0.28);
    });
  });
}

// Descending drone — ACCESS DENIED
function lose() {
  play((c, t) => {
    tone(c, t, 280, 55, 'sawtooth', 0.04, 0.35, 0.55, 0.28);
    tone(c, t, 140, 40, 'sine', 0.04, 0.4, 0.55, 0.16);
  });
}

// ── background music ────────────────────────────────────────────────────────

let bgAudio: HTMLAudioElement | null = null;

function startMusic() {
  if (bgAudio) return;
  bgAudio = new Audio('/sounds/bg-loop.ogg');
  bgAudio.loop = true;
  bgAudio.volume = 0.35;
  bgAudio.play().catch(() => {});
}

function stopMusic() {
  if (!bgAudio) return;
  bgAudio.pause();
  bgAudio.currentTime = 0;
  bgAudio = null;
}

export const sounds = { scan, correct, wrong, flag, purge, win, lose, startMusic, stopMusic };

let audioCtx = null;

export function unlockAudio() {
  if (typeof window === 'undefined') return null;
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  } catch {
    return null;
  }
}

function tone({ freq = 440, to = null, dur = 0.12, type = 'sine', gain = 0.06, delay = 0 }) {
  const ctx = unlockAudio();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const vol = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  vol.gain.setValueAtTime(0.0001, start);
  vol.gain.exponentialRampToValueAtTime(gain, start + 0.012);
  vol.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(vol).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

let bollCombo = 0;
let bollLast = -9999;

// Ao sair do app (tela apagada, outro app), o som para; volta quando o jogo reaparece.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!audioCtx) return;
    try {
      if (document.hidden) audioCtx.suspend();
      else audioCtx.resume();
    } catch {
      /* sem áudio */
    }
  });
}

export const sfx = {
  jump: () => tone({ freq: 330, to: 620, dur: 0.16, type: 'triangle', gain: 0.05 }),
  // capulho: "pop" macio e fofo seguido de brilho
  // sequência de capulhos pegos em seguida sobe de tom (até uma oitava), como uma escadinha
  boll: () => {
    const now = typeof performance !== 'undefined' ? performance.now() : 0;
    bollCombo = now - bollLast < 900 ? Math.min(bollCombo + 1, 12) : 0;
    bollLast = now;
    const k = 2 ** (bollCombo / 12);
    tone({ freq: 420 * k, to: 900 * k, dur: 0.07, type: 'sine', gain: 0.05 });
    tone({ freq: 1175 * k, dur: 0.12, type: 'sine', gain: 0.035, delay: 0.05 });
    tone({ freq: 1568 * k, dur: 0.14, type: 'triangle', gain: 0.02, delay: 0.1 });
  },
  spring: () => {
    tone({ freq: 160, to: 820, dur: 0.28, type: 'triangle', gain: 0.06 });
    tone({ freq: 240, to: 1200, dur: 0.22, type: 'sine', gain: 0.03, delay: 0.04 });
  },
  punch: () => {
    tone({ freq: 520, to: 160, dur: 0.12, type: 'square', gain: 0.045 });
    tone({ freq: 90, dur: 0.1, type: 'sawtooth', gain: 0.05, delay: 0.02 });
  },
  throw: () => {
    tone({ freq: 700, to: 260, dur: 0.14, type: 'triangle', gain: 0.045 });
    tone({ freq: 1200, to: 600, dur: 0.08, type: 'sine', gain: 0.02, delay: 0.03 });
  },
  tick: () => {
    tone({ freq: 1800, dur: 0.04, type: 'square', gain: 0.03 });
    tone({ freq: 1400, dur: 0.04, type: 'square', gain: 0.03, delay: 0.12 });
  },
  spit: () => {
    tone({ freq: 320, to: 900, dur: 0.12, type: 'sawtooth', gain: 0.03 });
    tone({ freq: 700, to: 200, dur: 0.14, type: 'triangle', gain: 0.03, delay: 0.1 });
  },
  slow: () => tone({ freq: 600, to: 140, dur: 0.5, type: 'triangle', gain: 0.05 }),
  stomp: () => tone({ freq: 240, to: 90, dur: 0.16, type: 'square', gain: 0.04 }),
  block: () => {
    tone({ freq: 180, to: 70, dur: 0.14, type: 'square', gain: 0.05 });
    tone({ freq: 520, dur: 0.1, type: 'triangle', gain: 0.035, delay: 0.05 });
  },
  fact: () => {
    tone({ freq: 660, dur: 0.12, type: 'triangle', gain: 0.05 });
    tone({ freq: 990, dur: 0.14, type: 'triangle', gain: 0.04, delay: 0.09 });
  },
  hurt: () => tone({ freq: 300, to: 110, dur: 0.35, type: 'sawtooth', gain: 0.045 }),
  gate: () => {
    [392, 523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.2, type: 'square', gain: 0.04, delay: i * 0.09 })
    );
  },
  power: () => {
    [523, 784, 1046, 1318].forEach((f, i) =>
      tone({ freq: f, dur: 0.16, type: 'triangle', gain: 0.045, delay: i * 0.07 })
    );
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, dur: 0.18, type: 'triangle', gain: 0.05, delay: i * 0.1 })
    );
  },
  correct: () => {
    [784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.16, type: 'sine', gain: 0.05, delay: i * 0.12 }));
  },
};
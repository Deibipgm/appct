import { unlockAudio } from './audio';

// Música de fundo de cada fase, sintetizada em tempo real (Web Audio): sem arquivos e sem direitos autorais.
// Cada fase tem andamento, escala e timbres próprios. O volume é baixo para não cobrir os efeitos.
const _ = null;
const SONGS = {
  // campo: animada e leve (pentatônica de Dó maior, ritmo de passeio)
  plantio: {
    bpm: 112, root: 60, scale: [0, 2, 4, 7, 9], mel: 'triangle', bassWave: 'triangle', vol: 1,
    melody: [4, _, 2, _, 4, 5, _, 4, 2, _, 0, _, 2, _, _, _, 4, _, 5, _, 7, _, 5, 4, 2, _, 4, _, 0, _, _, _],
    bass: [0, _, _, _, -3, _, _, _, 0, _, _, _, -2, _, -3, _],
    kick: [0, 8], hat: [2, 6, 10, 14],
  },
  // algodoeira: máquina, pulso mais firme (Lá menor)
  algodoeira: {
    bpm: 124, root: 57, scale: [0, 3, 5, 7, 10], mel: 'square', bassWave: 'sawtooth', vol: 0.8,
    melody: [4, _, _, 4, 3, _, 2, _, 0, _, 2, _, 3, _, _, _, 4, _, _, 4, 5, _, 4, _, 3, _, 2, _, 0, _, _, _],
    bass: [0, _, 0, _, 0, _, 0, _, -2, _, -2, _, -3, _, -3, _],
    kick: [0, 4, 8, 12], hat: [2, 6, 10, 14],
  },
  // laboratório: tecnológica e curiosa, arpejos (Ré dórico)
  laboratorio: {
    bpm: 100, root: 62, scale: [0, 2, 3, 5, 7, 9, 10], mel: 'sine', bassWave: 'sine', vol: 1.1,
    melody: [0, 2, 4, 2, 5, 4, 2, 0, 1, 3, 5, 3, 6, 5, 3, 1, 0, 2, 4, 2, 5, 7, 5, 4, 3, 5, 3, 1, 2, _, _, _],
    bass: [0, _, _, _, _, _, 0, _, -3, _, _, _, _, _, -3, _],
    kick: [0, 10], hat: [4, 12],
  },
  // campo responsável: alegre e saltitante, com flauta (Sol maior, pentatônica)
  manejo: {
    bpm: 120, root: 67, scale: [0, 2, 4, 7, 9], mel: 'triangle', bassWave: 'triangle', vol: 1,
    melody: [0, _, 2, 4, _, 2, 4, _, 5, _, 4, _, 2, _, _, _, 4, _, 5, 7, _, 5, 4, _, 2, _, 0, _, 2, _, _, _],
    bass: [0, _, -3, _, 0, _, -3, _, -2, _, -5, _, -3, _, -2, _],
    kick: [0, 8], hat: [4, 12],
  },
  // aplicação aérea: aventura no céu, rápida e heroica (Mi mixolídio)
  aereo: {
    bpm: 132, root: 64, scale: [0, 2, 4, 5, 7, 9, 10], mel: 'square', bassWave: 'triangle', vol: 0.85,
    melody: [0, _, 4, _, 7, _, 4, 7, 9, _, 7, _, 4, _, _, _, 5, _, 7, _, 9, _, 11, 9, 7, _, 4, _, 7, _, _, _],
    bass: [0, _, 0, _, -3, _, -3, _, -2, _, -2, _, -5, _, -3, _],
    kick: [0, 6, 8, 14], hat: [2, 4, 10, 12],
  },
  // fiação: caixinha de música, mágica e delicada (Fá lídio)
  fiacao: {
    bpm: 96, root: 65, scale: [0, 2, 4, 6, 7, 9, 11], mel: 'sine', bassWave: 'triangle', vol: 1.15, bell: true,
    melody: [4, _, 2, _, 0, _, 2, _, 4, _, 6, _, 4, _, _, _, 5, _, 4, _, 2, _, 0, _, 2, _, 4, _, 2, _, _, _],
    bass: [0, _, _, _, _, _, _, _, -3, _, _, _, _, _, _, _],
    kick: [], hat: [],
  },
};

const noteHz = (root, scale, deg, oct = 0) => {
  const n = scale.length;
  const o = Math.floor(deg / n);
  const semis = scale[((deg % n) + n) % n] + 12 * o + 12 * oct;
  return 440 * Math.pow(2, (root + semis - 69) / 12);
};

let state = null;

function noteOn(ctx, out, t, freq, dur, gain, type) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function hat(ctx, out, t, noiseBuf, gain) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'highpass';
  f.frequency.value = 6000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  s.connect(f).connect(g).connect(out);
  s.start(t);
  s.stop(t + 0.06);
}

function kick(ctx, out, t, gain) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + 0.2);
}

export function startMusic(levelId) {
  stopMusic(true);
  const song = SONGS[levelId];
  const ctx = unlockAudio();
  if (!song || !ctx) return;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.2);
  out.connect(ctx.destination);
  const nb = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
  const d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const step = 60 / song.bpm / 4; // semicolcheia
  state = { ctx, out, next: ctx.currentTime + 0.15, i: 0, timer: null };
  const tick = () => {
    if (!state) return;
    while (state.next < ctx.currentTime + 0.4) {
      const k = state.i % 32;
      const t = state.next;
      const m = song.melody[k];
      if (m != null) {
        noteOn(ctx, out, t, noteHz(song.root, song.scale, m, 1), step * 2.2, 0.05 * song.vol, song.mel);
        if (song.bell) noteOn(ctx, out, t, noteHz(song.root, song.scale, m, 2), step * 3, 0.018 * song.vol, 'sine');
      }
      const b = song.bass[k % 16];
      if (b != null) noteOn(ctx, out, t, noteHz(song.root, song.scale, b, -1), step * 3, 0.06 * song.vol, song.bassWave);
      if (song.kick.includes(k % 16)) kick(ctx, out, t, 0.09);
      if (song.hat.includes(k % 16)) hat(ctx, out, t, nb, 0.035);
      state.i++;
      state.next += step;
    }
  };
  tick();
  state.timer = setInterval(tick, 120);
}

export function stopMusic(quick = false) {
  if (!state) return;
  const { ctx, out, timer } = state;
  clearInterval(timer);
  out.gain.cancelScheduledValues(ctx.currentTime);
  out.gain.setTargetAtTime(0.0001, ctx.currentTime, quick ? 0.05 : 0.25);
  setTimeout(() => out.disconnect(), 1200);
  state = null;
}

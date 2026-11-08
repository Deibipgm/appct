import { unlockAudio } from './audio';

// Ambiente sonoro de cada fase, gerado em tempo real (sem arquivos de áudio).
let current = null;

function noiseSource(ctx) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; // ruído marrom (grave e suave)
    d[i] = last * 3.5;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  return src;
}

function osc(ctx, type, freq, gain, out) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g).connect(out);
  o.start();
  return { o, g };
}

function filtered(ctx, src, type, freq, gain, out) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(out);
  src.start();
  return { f, g };
}

function blip(ctx, out, freq, dur, gain, type = 'sine') {
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + dur + 0.05);
}

const SCENES = {
  // colhedora: motor diesel grave com ronco pulsante e poeira do campo
  plantio(ctx, out, timers) {
    const motor = osc(ctx, 'sawtooth', 48, 0.05, out);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 180;
    motor.g.disconnect();
    motor.g.connect(lp).connect(out);
    const lfo = osc(ctx, 'sine', 6, 4, motor.o.frequency);
    filtered(ctx, noiseSource(ctx), 'lowpass', 420, 0.18, out);
    osc(ctx, 'triangle', 96, 0.012, out);
    timers.push(setInterval(() => blip(ctx, out, 70 + Math.random() * 20, 0.25, 0.03, 'square'), 1800));
    return [motor.o, lfo.o];
  },
  // algodoeira: zumbido das máquinas, esteiras e batida ritmada da prensa
  algodoeira(ctx, out, timers) {
    const hum = osc(ctx, 'sawtooth', 60, 0.018, out);
    osc(ctx, 'sine', 120, 0.02, out);
    filtered(ctx, noiseSource(ctx), 'bandpass', 900, 0.22, out);
    let beat = 0;
    timers.push(
      setInterval(() => {
        beat++;
        blip(ctx, out, 55, 0.18, 0.09, 'square');
        if (beat % 2) blip(ctx, out, 320, 0.06, 0.02, 'triangle');
      }, 700)
    );
    return [hum.o];
  },
  // laboratório: ar-condicionado suave, zumbido elétrico e bipes dos equipamentos
  laboratorio(ctx, out, timers) {
    filtered(ctx, noiseSource(ctx), 'highpass', 1200, 0.05, out);
    osc(ctx, 'sine', 120, 0.008, out);
    osc(ctx, 'sine', 240, 0.004, out);
    timers.push(
      setInterval(() => {
        const f = [1046, 1318, 1568][Math.floor(Math.random() * 3)];
        blip(ctx, out, f, 0.12, 0.018);
        if (Math.random() < 0.4) setTimeout(() => blip(ctx, out, f * 1.25, 0.1, 0.014), 160);
      }, 2400)
    );
    return [];
  },
};

// Fiação: o zumbido das máquinas da algodoeira
SCENES.fiacao = SCENES.algodoeira ?? SCENES.laboratorio;
// Campo Responsável: só passarinhos cantando no campo (sem a colhedora)
SCENES.manejo = (ctx, out, timers) => {
  timers.push(
    setInterval(() => {
      const f = 2200 + Math.random() * 900;
      blip(ctx, out, f, 0.07, 0.016);
      setTimeout(() => blip(ctx, out, f * 1.18, 0.07, 0.014), 110);
      if (Math.random() < 0.5) setTimeout(() => blip(ctx, out, f * 0.9, 0.09, 0.012), 260);
    }, 2100)
  );
  return [];
};

// Aplicação Aérea: ronco grave do motor do avião e vento passando
SCENES.aereo = (ctx, out) => {
  const n = noiseSource(ctx);
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = 500;
  const g = ctx.createGain();
  g.gain.value = 0.05;
  n.connect(f).connect(g).connect(out);
  n.start();
  const m = osc(ctx, 'sawtooth', 62, 0.012, out);
  return [n, m.o];
};

export function startAmbience(levelId) {
  stopAmbience();
  const ctx = unlockAudio();
  const scene = SCENES[levelId];
  if (!ctx || !scene) return;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, ctx.currentTime);
  out.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 1.5);
  out.connect(ctx.destination);
  const timers = [];
  scene(ctx, out, timers);
  current = { ctx, out, timers };
}

export function stopAmbience() {
  if (!current) return;
  const { ctx, out, timers } = current;
  timers.forEach(clearInterval);
  out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
  setTimeout(() => out.disconnect(), 800);
  current = null;
}
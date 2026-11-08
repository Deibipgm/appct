import { TILE } from './config';
import { INK } from './brush';
import { emitCotton } from './fx';
import { ART, getSprite } from './sprites';

// Cardas a vapor da Fiação Mágica: de tempos em tempos soltam um jato que ergue o Dão e o deixa planar.
const CYCLE = 230;
const WARN = 130;
const BLAST = 170;
const END = 222;
const LIFT_W = 36; // meia largura da coluna de vapor
const COLUMN_H = 190;

export function initVents(eng) {
  const ground = eng.level.groundTop * TILE;
  eng.vents = (eng.level.vents ?? []).map((v, i) => ({
    px: (v.x + (v.w ?? 3) / 2) * TILE,
    top: ground - (v.h ?? 2) * TILE,
    ox: v.x,
    t: (v.phase ?? 0) + i * 60,
    puffs: [],
  }));
  // chaminés das cardas (todas soltam fumaça; as de vapor soltam mais forte antes e durante o jato)
  eng.smokers = (eng.level.obstacles ?? [])
    .filter((o) => o.art === 'carda')
    .map((o, i) => {
      const h = o.h * TILE + 6;
      const w = h * 1.5135;
      const left = o.x * TILE + (o.w * TILE) / 2 - w / 2;
      return { cx: left + 0.472 * w, cy: ground - h + 3 + 0.215 * h, k: h / 102, t: i * 37, puffs: [], vent: eng.vents.find((v) => v.ox === o.x) };
    });
}

export const ventState = (v) => {
  const k = v.t % CYCLE;
  return k >= BLAST && k < END ? 'blast' : k >= WARN && k < BLAST ? 'warn' : 'idle';
};

export function updateVents(eng) {
  const p = eng.player;
  p.flyGrace = Math.max(0, (p.flyGrace ?? 0) - 1);
  for (const v of eng.vents ?? []) {
    v.t++;
    const st = ventState(v);
    if (st !== 'idle' && v.t % 5 === 0) v.puffs.push({ x: (Math.random() - 0.5) * 16, y: 0, r: st === 'blast' ? 20 : 12, life: 0 });
    v.puffs.forEach((q) => {
      q.life++;
      q.y -= st === 'blast' ? 9 : 2.2;
      q.r += 0.35;
    });
    v.puffs = v.puffs.filter((q) => q.life < (st === 'blast' ? 34 : 50));
    if (st !== 'blast' || p.rope) continue;
    const hx = p.x + p.w / 2;
    if (Math.abs(hx - v.px) < LIFT_W && p.y + p.h < v.top + 8 && p.y + p.h > v.top - COLUMN_H) {
      p.vy = Math.max(p.vy - 1.6, -7.5);
      p.boost = true;
      p.onGround = false;
      p.flyT = 160;
      p.flyGrace = 8;
      if (v.t % 6 === 0) emitCotton(eng, hx, p.y + p.h, 2);
    }
  }
  for (const s of eng.smokers ?? []) {
    s.t++;
    const st = s.vent ? ventState(s.vent) : 'idle';
    const every = st === 'blast' ? 3 : st === 'warn' ? 6 : 11;
    // "tchuf-tchuf": dois sopros seguidos e uma pausa
    const chuff = st !== 'idle' || s.t % 44 < 22;
    if (chuff && s.t % every === 0) {
      const big = st === 'blast' ? 1.5 : st === 'warn' ? 1.2 : 1;
      s.puffs.push({ x: (Math.random() - 0.5) * 4, y: 0, vx: 0.35 + Math.random() * 0.35, vy: -(1 + Math.random() * 0.7) * (st === 'blast' ? 1.8 : 1), r: (5 + Math.random() * 2) * s.k * big, life: 0 });
    }
    s.puffs.forEach((q) => {
      q.life++;
      q.x += q.vx + Math.sin(q.life * 0.12) * 0.25;
      q.y += q.vy;
      q.vy *= 0.992;
      q.r += 0.2 * s.k;
    });
    s.puffs = s.puffs.filter((q) => q.life < 85);
  }
  // rastro de algodão enquanto plana
  if (p.flyT > 0 && !p.onGround && eng.time % 0.1 < 1 / 60) emitCotton(eng, p.x + p.w / 2 - p.face * 8, p.y + p.h * 0.7, 1);
}

export function drawVents(ctx, eng) {
  const cam = eng.camera;
  const cloud = getSprite(ART.nuvem);
  (eng.smokers ?? []).forEach((s) => {
    const sx = s.cx - cam;
    if (sx < -200 || sx > 1160) return;
    s.puffs.forEach((q) => {
      const a = Math.max(0, 1 - q.life / 85);
      ctx.globalAlpha = a * 0.92;
      const w = q.r * 3.4;
      const px = sx + q.x;
      const py = s.cy + q.y;
      if (cloud) ctx.drawImage(cloud, px - w / 2, py - (w * cloud.naturalHeight) / cloud.naturalWidth / 2, w, (w * cloud.naturalHeight) / cloud.naturalWidth);
      else {
        ctx.fillStyle = '#FFFDF7';
        ctx.beginPath();
        ctx.arc(px, py, q.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  });
  (eng.vents ?? []).forEach((v) => {
    const x = v.px - cam;
    if (x < -120 || x > 1080) return;
    const st = ventState(v);
    if (st === 'blast') {
      const g = ctx.createLinearGradient(0, v.top, 0, v.top - COLUMN_H);
      g.addColorStop(0, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - LIFT_W, v.top - COLUMN_H, LIFT_W * 2, COLUMN_H);
    }
    v.puffs.forEach((q) => {
      const a = Math.max(0, 1 - q.life / (st === 'blast' ? 34 : 50));
      ctx.globalAlpha = a * 0.9;
      const px = x + q.x + Math.sin(q.life * 0.3) * 4;
      const py = v.top + q.y;
      if (cloud) {
        const w = q.r * 3.2;
        ctx.drawImage(cloud, px - w / 2, py - (w * cloud.naturalHeight) / cloud.naturalWidth / 2, w, (w * cloud.naturalHeight) / cloud.naturalWidth);
      } else {
        ctx.fillStyle = '#FFFDF7';
        ctx.beginPath();
        ctx.arc(px, py, q.r, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
    // aviso: seta pulsando antes do jato
    if (st === 'warn') {
      const k = Math.sin(eng.time * 18) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 206, 60, ${0.5 + k * 0.5})`;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x, v.top - 46 - k * 6);
      ctx.lineTo(x - 14, v.top - 26 - k * 6);
      ctx.lineTo(x + 14, v.top - 26 - k * 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  });
}

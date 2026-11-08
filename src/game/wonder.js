import { TILE, VIEW_W } from './config';
import { INK, star } from './brush';
import { getCutout } from './cutout';
import { ART_BASE } from './sprites';
import { emitCotton, emitLeaves } from './fx';

// Surpresas das fases (ideias de Super Mario Wonder e metroidvania):
//  - Parede secreta: tem uma rachadura; um soco quebra e solta capulhos escondidos.
//  - Esteira: faixa do chão que empurra o Dão para um lado.
const PUNCH_FRAMES = 20;
const PUNCH_REACH = 50;

export function initWonder(eng) {
  eng.secrets = eng.level.secrets ?? [];
  eng.belts = eng.level.belts ?? [];
}

export function updateWonder(eng) {
  const p = eng.player;

  // Parede secreta: o soco estica o braço e quebra
  if (p.punchT > 4 && p.punchT < PUNCH_FRAMES - 3) {
    const x1 = p.face > 0 ? p.x + p.w - 6 : p.x - PUNCH_REACH;
    const x2 = p.face > 0 ? p.x + p.w + PUNCH_REACH : p.x + 6;
    for (const s of eng.secrets) {
      if (s.broken) continue;
      const top = (eng.level.groundTop - s.h) * TILE;
      if (s.x * TILE + TILE > x1 && s.x * TILE < x2 && top < p.y + p.h && eng.level.groundTop * TILE > p.y) {
        s.broken = true;
        for (let y = eng.level.groundTop - s.h; y < eng.level.groundTop; y++) {
          if (eng.level.grid[y][s.x] === 3) eng.level.grid[y][s.x] = 0;
        }
        const bx = s.x * TILE + TILE / 2;
        const by = top + (s.h * TILE) / 2;
        for (let i = 0; i < 7; i++) eng.bonuses.push({ x: bx + (i - 3) * 14, y: by, vy: -5.5 - (i % 3) * 1.4, t: 0 });
        emitCotton(eng, bx, by, 16);
        emitLeaves(eng, bx, by, 6);
        eng.score += 80;
        eng.shake = 9;
        eng.pows.push({ x: bx, y: by, t: 0 });
        eng.hooks.onSound?.('block');
      }
    }
  }
}

// Esteira: devolve quanto empurrar o Dão neste quadro.
export function beltPush(eng) {
  const p = eng.player;
  if (!p.onGround || !eng.belts.length) return 0;
  const cx = p.x + p.w / 2;
  const feet = p.y + p.h;
  for (const b of eng.belts) {
    const surface = (eng.level.groundTop - (b.lift ?? 0)) * TILE;
    if (cx >= b.x * TILE && cx <= (b.x + b.w) * TILE && Math.abs(feet - surface) < 3) return b.dir * 0.9;
  }
  return 0;
}

export function drawWonder(ctx, eng) {
  const { level, camera, time } = eng;
  const gy = level.groundTop * TILE;

  // esteiras (arte da esteira, elevadas do chão)
  eng.belts.forEach((b) => {
    const x0 = b.x * TILE - camera;
    const w = b.w * TILE + 10;
    if (x0 > VIEW_W || x0 + w < 0) return;
    const top = gy - (b.lift ?? 0) * TILE;
    const art = getCutout(`${ART_BASE}${b.art ?? 'esteira'}.png`, b.crop ?? [0, 0, 1, 1], 'alpha');
    if (!art) return;
    const h = w * (art.height / art.width);
    const dx = b.dir > 0 ? x0 - 4 : x0 - 4;
    ctx.drawImage(art, dx, top - h * (b.artTop ?? 0.29), w, h);
    // listras claras correndo na superfície mostram o sentido da esteira
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, top - 1, b.w * TILE, 5);
    ctx.clip();
    ctx.fillStyle = 'rgba(255, 220, 90, 0.85)';
    const off = (((time * 46 * b.dir) % 28) + 28) % 28;
    for (let x = x0 - 28 + off; x < x0 + b.w * TILE; x += 28) ctx.fillRect(x, top, 10, 3);
    ctx.restore();
  });

  // paredes secretas: rachadura e brilho
  eng.secrets.forEach((s) => {
    if (s.broken) return;
    const sx = s.x * TILE - camera;
    if (sx < -60 || sx > VIEW_W + 60) return;
    const top = gy - s.h * TILE;
    ctx.save();
    ctx.strokeStyle = 'rgba(27,18,12,0.85)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(sx + 26, top + 6);
    ctx.lineTo(sx + 20, top + 22);
    ctx.lineTo(sx + 30, top + 34);
    ctx.lineTo(sx + 18, top + 52);
    ctx.stroke();
    ctx.restore();
    const k = (Math.sin(time * 4 + s.x) + 1) / 2;
    star(ctx, sx + TILE - 8, top + 12, 4, 6 + 4 * k, 1.8, time);
    ctx.fillStyle = `rgba(255, 224, 90, ${0.6 + 0.4 * k})`;
    ctx.fill();
  });

}

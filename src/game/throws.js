import { TILE, ROWS, VIEW_W } from './config';
import { INK, puffCluster } from './brush';
import { emitCotton, emitLeaves } from './fx';
import { hitBossWith } from './boss';

// Poder do Dão: arremessa bolas de algodão que quicam no chão e derrubam as pragas.
const COOLDOWN = 20;
const MAX_BALLS = 3;
const SPEED = 8.5;
const R = 10;
export const THROW_FRAMES = 18;
const RELEASE_AT = 11;

export function updateThrows(eng) {
  const p = eng.player;
  eng.balls = eng.balls ?? [];
  if (p.throwCd > 0) p.throwCd--;
  const tap = eng.input.throwTap;
  eng.input.throwTap = false;
  const pressed = tap || (eng.input.throw && !eng.prevThrow);
  eng.prevThrow = eng.input.throw;
  if (p.throwT > 0) p.throwT--;
  if (pressed && !(p.throwCd > 0) && eng.balls.length < MAX_BALLS) {
    // começa a pose: braço para trás; a bola sai quando o braço vem para a frente
    p.throwCd = COOLDOWN;
    p.throwT = THROW_FRAMES;
    p.throwPending = true;
  }
  if (p.throwPending && p.throwT <= RELEASE_AT) {
    p.throwPending = false;
    eng.balls.push({
      x: p.x + p.w / 2 + p.face * 18,
      y: p.y + p.h * 0.25,
      vx: p.face * SPEED + p.vx * 0.3,
      vy: -3.5,
      t: 0,
      bounces: 0,
    });
    eng.hooks.onSound?.('throw');
  }

  const solid = (x, y) => eng.solidAt(Math.floor(x / TILE), Math.floor(y / TILE));
  eng.balls = eng.balls.filter((b) => {
    b.t++;
    b.vy = Math.min(b.vy + 0.42, 9);
    b.x += b.vx;
    if (solid(b.x + Math.sign(b.vx) * R, b.y)) return poof(eng, b);
    b.y += b.vy;
    if (b.vy > 0 && solid(b.x, b.y + R)) {
      b.y = Math.floor((b.y + R) / TILE) * TILE - R;
      b.vy = -6;
      if (++b.bounces > 3) return poof(eng, b);
    }
    if (b.t > 110 || b.y > ROWS * TILE + 40 || Math.abs(b.x - (p.x + p.w / 2)) > VIEW_W) return false;

    for (const e of eng.enemies) {
      if (e.dead) continue;
      if (b.x + R > e.x && b.x - R < e.x + e.w && b.y + R > e.y && b.y - R < e.y + e.h) {
        e.dead = true;
        e.deadT = 0;
        eng.score += 60;
        eng.pows.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, t: 0 });
        emitLeaves(eng, e.x + e.w / 2, e.y + e.h / 2, 3);
        eng.hooks.onSound?.('stomp');
        eng.emitHud();
        return poof(eng, b);
      }
    }
    if (hitBossWith(eng, b.x, b.y, R)) return poof(eng, b);
    return true;
  });
}

function poof(eng, b) {
  emitCotton(eng, b.x, b.y, 6);
  return false;
}

export function drawThrows(ctx, eng) {
  (eng.balls ?? []).forEach((b) => {
    const x = b.x - eng.camera;
    ctx.save();
    ctx.translate(x, b.y);
    ctx.rotate(b.t * 0.35 * Math.sign(b.vx || 1));
    puffCluster(ctx, 0, 0, [[0, 0, 7], [-5, 2, 5.4], [5, 2, 5.4], [0, -5, 5.4], [0, 5, 5]], 1, '#FFFDF7', INK);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(-2.5, -2.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
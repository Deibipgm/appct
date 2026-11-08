import { ink, puffCluster, star } from '@/game/brush';
import { drawWeevil, drawWhitefly } from '@/game/render';
import { BLOCKS } from './config';
import {
  drawSky,
  drawSun,
  drawClouds,
  drawHills,
  drawBarn,
  drawCottonField,
  drawGrassBlock,
  drawGround,
} from './backdrop';
import { drawHero } from './hero';
import { drawGoal } from './goal';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

function drawCoins(ctx, s) {
  for (const c of s.coins) {
    if (c.takenAt != null) continue;
    const grow = c.spawnAt != null ? clamp01((s.t - c.spawnAt) / 0.34) : 1;
    if (grow <= 0) continue;

    ctx.save();
    ctx.translate(c.x, c.y + Math.sin(s.t * 2.1 + c.phase) * 7);
    ctx.rotate(Math.sin(s.t * 1.5 + c.phase) * 0.09);
    ctx.scale(grow, grow);

    ctx.beginPath();
    ctx.arc(0, 0, 27, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,240,183,0.94)';
    ctx.fill();
    ink(ctx, 2.6);

    puffCluster(ctx, 0, 1, [[0, 0, 8], [-6, 3, 5.5], [6, 3, 5.5], [0, -6, 5.5]], 1, '#FFFDF7');

    star(ctx, 12, -13, 4, 6, 2.2, s.t * 3 + c.phase);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.restore();
  }
}

function drawParticles(ctx, s) {
  for (const p of s.particles) {
    const a = clamp01(p.life / p.max);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (0.6 + a * 0.6), 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function paintScene(ctx, s) {
  ctx.save();
  if (s.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  }

  drawSky(ctx);
  drawSun(ctx, s.t);
  drawClouds(ctx, s.t);
  drawHills(ctx);
  drawBarn(ctx);
  drawCottonField(ctx, s.t);

  BLOCKS.forEach((b, i) => drawGrassBlock(ctx, b, i));
  drawGround(ctx);
  drawGoal(ctx, s.t);

  drawCoins(ctx, s);

  if (s.weevil.dead <= 0) {
    drawWeevil(
      ctx,
      s.weevil.x,
      s.weevil.y,
      s.weevil.w,
      s.weevil.h,
      s.t,
      Math.sign(s.weevil.vx) || 1,
      s.weevil.alert
    );
  }
  if (s.fly.dead <= 0) {
    drawWhitefly(ctx, s.fly.x, s.fly.y, s.fly.w, s.fly.h, s.t, s.fly.mode);
  }

  drawHero(ctx, s);
  drawParticles(ctx, s);

  ctx.restore();
}
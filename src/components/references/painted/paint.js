import { STAGE } from '../wonder/config';
import { buildBackdrop } from './landscape';
import { drawPaintedHero, drawHeroShadow } from './hero';
import { drawPaintedWeevil, drawPaintedFly, drawCottonToken } from './foes';
import { paintGoal } from './goal';

let backdrop = null;

function paintParticles(ctx, particles) {
  particles.forEach((p) => {
    const a = Math.max(0, Math.min(1, p.life / 0.95));
    ctx.globalAlpha = a * 0.9;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = a * 0.5;
    ctx.fillStyle = '#FFF6DE';
    ctx.beginPath();
    ctx.arc(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

export function paintPainted(ctx, s) {
  if (!backdrop) backdrop = buildBackdrop();

  ctx.save();
  if (s.shake > 0.4) ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
  ctx.drawImage(backdrop, 0, 0, STAGE.w, STAGE.h);
  paintGoal(ctx, s.t);

  s.coins.forEach((c) => {
    if (c.takenAt != null) return;
    drawCottonToken(ctx, c.x, c.y + Math.sin(s.t * 2.1 + c.phase) * 7, s.t);
  });

  drawHeroShadow(ctx, s.hero);
  drawPaintedWeevil(ctx, s.weevil, s.t);
  drawPaintedFly(ctx, s.fly, s.t);
  drawPaintedHero(ctx, s.hero, s.t);
  paintParticles(ctx, s.particles);

  // véu de luz quente: sol à esquerda, sombra à direita
  const light = ctx.createLinearGradient(0, 0, STAGE.w, STAGE.h);
  light.addColorStop(0, 'rgba(255, 226, 168, 0.18)');
  light.addColorStop(0.55, 'rgba(255, 226, 168, 0)');
  light.addColorStop(1, 'rgba(84, 48, 24, 0.16)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, STAGE.w, STAGE.h);

  ctx.restore();
}
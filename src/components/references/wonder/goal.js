import { STAGE, GOAL } from './config';
import { ink, star } from '@/game/brush';

// Chegada do estudo: mastro com bandeira "CHEGADA" e capulho no topo.
export function drawGoal(ctx, t) {
  const x = GOAL.x;
  const base = STAGE.ground + 4;
  const top = base - 132;
  const wave = Math.sin(t * 2.2) * 7;

  ctx.beginPath();
  ctx.ellipse(x - 6, base - 1, 26, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(27,18,12,0.16)';
  ctx.fill();

  // mastro
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, top);
  ink(ctx, 9);
  ctx.beginPath();
  ctx.moveTo(x, base);
  ctx.lineTo(x, top);
  ink(ctx, 4.6, '#B4804C');

  // bandeira de tecido com leve ondulação
  ctx.beginPath();
  ctx.moveTo(x - 2, top + 8);
  ctx.quadraticCurveTo(x - 34, top + 16 + wave, x - 66, top + 30 + wave * 1.2);
  ctx.quadraticCurveTo(x - 34, top + 46 + wave * 0.4, x - 2, top + 50);
  ctx.closePath();
  ctx.fillStyle = '#E81E25';
  ctx.fill();
  ink(ctx, 3);

  ctx.save();
  ctx.fillStyle = '#FFFDF7';
  ctx.font = '900 13px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHEGADA', x - 32, top + 33);
  ctx.restore();

  // capulho no topo do mastro
  star(ctx, x, top - 6, 6, 15, 9, t * 0.7);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ink(ctx, 2.2);
}
import { STAGE, GOAL } from '../wonder/config';
import { daub, streak, glow } from './brush';

// Chegada em pintura: mastro de madeira, bandeira vermelha e capulho brilhando.
export function paintGoal(ctx, t) {
  const x = GOAL.x;
  const base = STAGE.ground + 4;
  const top = base - 132;
  const wave = Math.sin(t * 1.7) * 4;

  daub(ctx, x - 20, base - 2, 34, 5, 0, 'rgba(70, 40, 20, 0.2)', 1);

  // mastro
  streak(ctx, x, base, x, top, 'rgba(96, 58, 32, 0.95)', 7.4, 1);
  streak(ctx, x - 1.6, base, x - 1.6, top, 'rgba(214, 164, 112, 0.6)', 2.4, 0.9);

  // bandeira de tecido
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 2, top + 10);
  ctx.quadraticCurveTo(x - 30, top + 18 + wave, x - 58, top + 30 + wave * 1.3);
  ctx.quadraticCurveTo(x - 30, top + 44 + wave * 0.5, x - 2, top + 48);
  ctx.closePath();
  const cloth = ctx.createLinearGradient(x - 56, top + 8, x - 4, top + 48);
  cloth.addColorStop(0, '#E9583C');
  cloth.addColorStop(1, '#B5341F');
  ctx.fillStyle = cloth;
  ctx.fill();
  ctx.restore();

  streak(ctx, x - 6, top + 15, x - 40, top + 23 + wave, 'rgba(255, 216, 176, 0.35)', 2.2, 0.8);

  ctx.save();
  ctx.fillStyle = 'rgba(255, 248, 232, 0.95)';
  ctx.font = '800 13px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CHEGADA', x - 28, top + 34);
  ctx.restore();

  glow(ctx, x, top - 8, 16, 'rgba(255, 250, 232, 0.55)');
  daub(ctx, x, top - 8, 7, 6.4, 0, '#FFFBF0', 1);
  daub(ctx, x + 1.4, top - 6.4, 4.4, 3.2, 0, 'rgba(216, 186, 154, 0.45)', 1);
}
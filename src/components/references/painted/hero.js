import { daub, streak, glow } from './brush';

const C = {
  cotton: '#FEFCF6',
  cottonMid: '#EDE9DE',
  cottonShade: '#CFC8B9',
  suit: '#1A7BE8',
  suitDark: '#0C4E9C',
  suitLight: '#69B8FF',
  cape: '#DC3545',
  capeDark: '#A6222F',
  gold: '#FFC107',
  goldDark: '#C89100',
  leaf: '#6B4D36',
};

// sombra longa, projetada para a direita (sol baixo à esquerda)
export function drawHeroShadow(ctx, h) {
  const cx = h.x + h.w / 2;
  const feet = h.y + h.h;
  const lift = h.onGround ? 0 : 10;
  ctx.save();
  ctx.globalAlpha = h.onGround ? 0.24 : 0.12;
  ctx.fillStyle = '#42260F';
  ctx.beginPath();
  ctx.ellipse(cx + 18, feet - 1 + lift, 32, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Dão, o super-herói do algodão, em pintura: capulho na cabeça, capa vermelha e macacão azul.
export function drawPaintedHero(ctx, h, t) {
  const cx = h.x + h.w / 2;
  const feet = h.y + h.h;
  const dir = h.face || 1;
  const sq = h.squash || 0;
  const bob = h.onGround && Math.abs(h.vx) > 24 ? -Math.abs(Math.sin(h.walk)) * 2.4 : Math.sin(t * 2.1) * 1.2;
  const swing = h.onGround ? Math.sin(h.walk) * 3 : 0;
  const air = !h.onGround;

  ctx.save();
  ctx.translate(cx, feet + bob);
  ctx.scale(1 + sq * 0.35, 1 - sq * 0.6);
  ctx.translate(-cx, -feet);

  // capa: pincelada larga esvoaçando atrás
  const flap = Math.sin(t * 5.6) * 4 + (air ? 5 : 0);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - dir * 3.4, feet - 39);
  ctx.quadraticCurveTo(cx - dir * 20, feet - 33 + flap, cx - dir * 26, feet - 10 + flap * 1.4);
  ctx.quadraticCurveTo(cx - dir * 12, feet - 21, cx - dir * 2.4, feet - 20);
  ctx.closePath();
  ctx.fillStyle = C.cape;
  ctx.fill();
  ctx.restore();
  streak(ctx, cx - dir * 7, feet - 33, cx - dir * 19, feet - 14 + flap, C.capeDark, 3.4, 0.75);

  // pernas do macacão e botas vermelhas
  [-1, 1].forEach((side) => {
    const off = side * 4.8 + side * swing * 0.5;
    streak(ctx, cx + off, feet - 23, cx + off, feet - 11, C.suit, 6.8, 1);
    streak(ctx, cx + off + side * 1.4, feet - 23, cx + off + side * 1.4, feet - 12, C.suitLight, 1.8, 0.55);
    daub(ctx, cx + off + dir * 0.6, feet - 5.6, 5, 3.6, 0, C.cape, 1);
    daub(ctx, cx + off + dir * 1.8, feet - 3.2, 3.4, 1.5, 0, C.capeDark, 0.8);
  });

  // braços: manga azul e luva vermelha
  [-1, 1].forEach((side) => {
    const handX = cx + side * 12 + dir * 2;
    const handY = feet - 27 + side * swing + (air ? side * 1.6 : 0);
    streak(ctx, cx + side * 8, feet - 36, cx + side * 9.6, feet - 30, C.suit, 5.6, 1);
    streak(ctx, cx + side * 9.6, feet - 30, handX, handY, C.cape, 4.6, 1);
    daub(ctx, handX, handY, 3.2, 3, 0, C.cape, 1);
    daub(ctx, handX - side * 1.2, handY - 1.2, 1.4, 1.2, 0, C.capeDark, 0.6);
  });

  // tronco do macacão com luz vinda da esquerda
  const suitGrad = ctx.createLinearGradient(cx - 11, feet - 40, cx + 11, feet - 20);
  suitGrad.addColorStop(0, '#4AA0F5');
  suitGrad.addColorStop(1, C.suitDark);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, feet - 30, 10.6, 9.8, 0, 0, Math.PI * 2);
  ctx.fillStyle = suitGrad;
  ctx.fill();
  ctx.restore();
  streak(ctx, cx - 6, feet - 37, cx - 6, feet - 23, C.suitLight, 2.4, 0.5);

  // cinto dourado
  streak(ctx, cx - 9.6, feet - 25.6, cx + 9.6, feet - 25.6, C.gold, 4.6, 1);
  daub(ctx, cx, feet - 25.6, 3, 2.6, 0, C.goldDark, 0.9);

  // gola da capa
  daub(ctx, cx, feet - 38.8, 7.4, 3.2, 0, C.cape, 1);
  daub(ctx, cx + dir * 2.4, feet - 37.8, 2.2, 1.6, 0, C.capeDark, 0.85);

  // cabeça de capulho, feita de pinceladas redondas
  const headY = feet - 47;
  glow(ctx, cx, headY - 2, 22, 'rgba(255, 253, 244, 0.55)');
  [
    [-7, -4.4, 8.2],
    [7, -4.4, 8.2],
    [0, -9, 7.6],
    [-8.6, 3.6, 7],
    [8.6, 3.6, 7],
    [0, 1.4, 10.6],
  ].forEach(([dx, dy, r]) => {
    daub(ctx, cx + dx, headY + dy, r, r * 0.94, 0, C.cotton, 1);
    daub(ctx, cx + dx + r * 0.34, headY + dy + r * 0.42, r * 0.6, r * 0.44, 0.2, C.cottonMid, 0.75);
  });
  streak(ctx, cx - 4.6, headY + 4.4, cx + 5.6, headY + 6.6, C.cottonShade, 2, 0.5);

  // folhas do cálice na base do capulho
  [
    [-8.2, 0.8, -0.75],
    [-2.6, 1.9, -0.25],
    [2.8, 1.8, 0.28],
    [8.2, 0.8, 0.75],
  ].forEach(([dx, dy, rot]) => {
    daub(ctx, cx + dx, headY + 8.8 + dy, 3.8, 2.2, rot, C.leaf, 1);
  });

  // rosto
  const fx = cx + dir * 2;
  const blink = h.blink < 0.09;
  [-3.6, 3.6].forEach((dx) => {
    daub(ctx, fx + dx, headY - 0.4, 1.9, blink ? 0.5 : 2.4, 0, '#2A1B12', 1);
    if (!blink) daub(ctx, fx + dx + dir * 0.7, headY - 1.2, 0.7, 0.8, 0, 'rgba(255,255,255,0.9)', 1);
  });

  // sobrancelhas decididas
  streak(ctx, fx - 6.8, headY - 6.4, fx - 1.8, headY - 4.6, 'rgba(42, 27, 18, 0.9)', 1.8, 1);
  streak(ctx, fx + 6.8, headY - 6.4, fx + 1.8, headY - 4.6, 'rgba(42, 27, 18, 0.9)', 1.8, 1);

  // sorriso confiante
  ctx.save();
  ctx.strokeStyle = 'rgba(96, 66, 42, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(fx - 2.6, headY + 4.2);
  ctx.quadraticCurveTo(fx + 1.2, headY + 6.4, fx + 4.4, headY + 3.8);
  ctx.stroke();
  ctx.restore();

  daub(ctx, fx - 7, headY + 3.6, 2.6, 1.6, 0, 'rgba(234, 122, 122, 0.4)', 1);
  daub(ctx, fx + 7, headY + 3.6, 2.6, 1.6, 0, 'rgba(234, 122, 122, 0.4)', 1);

  ctx.restore();
}
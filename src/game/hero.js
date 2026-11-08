import { ink, rr } from './brush';
import { ART, getSprite, drawSprite } from './sprites';
import { throwPose, drawThrowArm } from './throwPose';

const C = {
  cotton: '#FEFDFA',
  cottonShade: 'rgba(198, 192, 178, 0.8)',
  suit: '#1479E8',
  suitDark: '#0C4E9C',
  suitLight: 'rgba(99, 180, 255, 0.55)',
  cape: '#DC3545',
  capeDark: '#A6222F',
  gold: '#FFC107',
  goldDark: '#C89100',
  leaf: '#6B4D36',
};

// Dão, o super-herói do algodão: cabeça de capulho, macacão azul, capa e luvas vermelhas.
// Estrela de impacto no punho durante o soco.
export function drawPunchBurst(ctx, x, y, k, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(t * 6);
  const r = 14 + 10 * k;
  ctx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rr = i % 2 ? r * 0.5 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255, 220, 70, 0.95)';
  ctx.fill();
  ctx.strokeStyle = '#1B120C';
  ctx.lineWidth = 2.6;
  ctx.stroke();
  ctx.restore();
}

// Joia e piscadinha (quadros do GIF): joia, pisca, joia. Os quadros se misturam
// por alguns instantes para a troca ficar suave, e o corpo respira de leve.
const JOIA = [
  { ms: 700 },
  { ms: 380 },
  { ms: 900 },
];
const JOIA_FADE = 110;
function drawJoia(ctx, cx, feet, frames) {
  const imgs = ART.heroJoia.map(getSprite);
  if (imgs.some((i) => !i)) return false;
  const total = JOIA.reduce((s, f) => s + f.ms, 0);
  const ms = ((frames * 1000) / 60) % total;
  let acc = 0;
  let idx = 0;
  for (let i = 0; i < JOIA.length; i++) {
    if (ms < acc + JOIA[i].ms) {
      idx = i;
      break;
    }
    acc += JOIA[i].ms;
  }
  const into = ms - acc;
  const prev = (idx + JOIA.length - 1) % JOIA.length;
  const h = 118;
  const w = (h * imgs[0].naturalWidth) / imgs[0].naturalHeight;
  const breathe = 1 + Math.sin(frames / 18) * 0.012;
  const y = feet + 6;
  ctx.save();
  ctx.translate(cx, y);
  ctx.scale(1, breathe);
  if (into < JOIA_FADE) {
    const k = into / JOIA_FADE;
    ctx.globalAlpha = 1;
    ctx.drawImage(imgs[prev], -w / 2, -h, w, h);
    ctx.globalAlpha = k;
    ctx.drawImage(imgs[idx], -w / 2, -h, w, h);
  } else {
    ctx.drawImage(imgs[idx], -w / 2, -h, w, h);
  }
  ctx.restore();
  return true;
}

// Só ao levar dano o Dão fica translúcido (pulsando devagar); no início da fase não pisca.
export function drawCaipira(ctx, eng) {
  const p = eng.player;
  const hurt = p.invuln > 0 && p.hurtFx;
  const flying = p.flyT > 0 && !p.onGround;
  // esticar e amassar (squash & stretch): estica subindo e caindo, amassa ao pousar
  if (p.sqAir && p.onGround && (p.sqVy ?? 0) > 3.5) p.sqT = 9;
  p.sqAir = !p.onGround;
  p.sqVy = p.vy;
  if (p.sqT > 0) p.sqT--;
  let sx = 1;
  let sy = 1;
  if (p.sqT > 0) {
    const k = p.sqT / 9;
    sy = 1 - 0.16 * k;
    sx = 1 + 0.12 * k;
  } else if (!p.onGround && !flying && !p.rope) {
    const k = Math.min(1, Math.abs(p.vy) / 14);
    sy = 1 + 0.09 * k;
    sx = 1 - 0.06 * k;
  }
  const squash = sx !== 1 || sy !== 1;
  if (!hurt && !flying && !squash) return drawCaipiraBody(ctx, eng);
  ctx.save();
  if (squash) {
    const fx = p.x + p.w / 2 - eng.camera;
    const fy = p.y + p.h;
    ctx.translate(fx, fy);
    ctx.scale(sx, sy);
    ctx.translate(-fx, -fy);
  }
  if (flying) {
    // voando no vapor: o Dão se inclina como um super-herói, subindo com o nariz para cima e planando de bruços
    const cx = p.x + p.w / 2 - eng.camera;
    const cy = p.y + p.h * 0.55;
    const tilt = p.vy < -1 ? -0.5 : 0.62;
    p.tilt = (p.tilt ?? 0) + (tilt * p.face - (p.tilt ?? 0)) * 0.18;
    ctx.translate(cx, cy);
    ctx.rotate(p.tilt + Math.sin(eng.time * 9) * 0.04);
    ctx.translate(-cx, -cy);
  } else p.tilt = 0;
  if (hurt) ctx.globalAlpha = 0.62 + 0.2 * Math.sin(eng.time * 12);
  drawCaipiraBody(ctx, eng);
  ctx.restore();
}

function drawCaipiraBody(ctx, eng) {
  const p = eng.player;
  const t = eng.time;

  const cx = Math.round(p.x + p.w / 2 - eng.camera);
  const feet = Math.round(p.y + p.h);
  const dir = p.face;
  const moving = p.onGround && Math.abs(p.vx) > 0.4;
  const swing = moving ? Math.sin(p.anim) : 0;
  const airborne = !p.onGround;
  const bob = moving ? Math.abs(Math.sin(p.anim)) * 1.4 : 0;
  const armSwing = airborne ? (p.vy < 0 ? -6 : 5) : -swing * 6;
  const headY = feet - 45 + bob * 0.5;
  // o Dão voa: fica alguns centímetros acima do chão, balançando de leve
  const hover = 9 + Math.sin(t * 4) * 1.5;

  // sombra no chão
  ctx.fillStyle = 'rgba(27, 18, 12, 0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, feet + 3, 15, 4.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // aura do capulho dourado
  if (eng.power > 0) {
    const pulse = 1 + Math.sin(t * 7) * 0.08;
    ctx.fillStyle = 'rgba(255, 200, 40, 0.22)';
    ctx.beginPath();
    ctx.arc(cx, feet - 22, 30 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 214, 63, 0.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, feet - 22, 24 * pulse, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Arte conceitual do herói (capulho de capa vermelha) em pose fixa:
  // sem inclinação, esticamento ou linhas ligadas à velocidade, para não tremer.
  const art = getSprite(ART.hero);
  if (art) {
    if (eng.finale && p.dance) {
      if (p.dance.joia && drawJoia(ctx, cx, feet - hover, p.dance.t)) return;
      drawSprite(ctx, art, cx, feet - 34 - hover, 100, { sx: 1, sy: 1, rot: -0.2 });
      return;
    }
    // soco: o Dão dá um bote para a frente com o punho esticado
    const k = p.punchT > 0 ? Math.sin(Math.PI * (1 - p.punchT / 20)) : 0;
    const th = throwPose(p);
    const lunge = dir * (16 * k + th.lunge);
    drawSprite(ctx, art, cx + lunge, feet - 34 - hover, 100, {
      dir,
      rot: -0.2 * dir + dir * (0.22 * k + th.rot),
      sx: 1 + 0.12 * k + th.stretch,
      sy: 1 - 0.05 * k - th.stretch * 0.5,
    });
    if (k > 0.55) drawPunchBurst(ctx, cx + lunge + dir * 46, feet - 52 - hover, k, t);
    drawThrowArm(ctx, cx + lunge, feet - hover, dir, th);
    return;
  }

  // linhas de velocidade do voo (só no desenho antigo, quando a arte não carregou)
  if (Math.abs(p.vx) > 5 || airborne) {
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - dir * 20, feet - 34 + i * 9);
      ctx.lineTo(cx - dir * 36, feet - 34 + i * 9);
      ctx.stroke();
    }
  }

  // capa vermelha esvoaçando
  const flap = Math.sin(t * 7) * 2.6 + (airborne ? 3.6 : 0);
  ctx.beginPath();
  ctx.moveTo(cx - dir * 3, feet - 38);
  ctx.quadraticCurveTo(cx - dir * 18, feet - 34 + flap, cx - dir * 24, feet - 11 + flap * 1.5);
  ctx.quadraticCurveTo(cx - dir * 11, feet - 22, cx - dir * 2, feet - 20);
  ctx.closePath();
  ctx.fillStyle = C.cape;
  ctx.fill();
  ink(ctx, 2.4);
  ctx.beginPath();
  ctx.moveTo(cx - dir * 7, feet - 33);
  ctx.quadraticCurveTo(cx - dir * 15, feet - 24 + flap, cx - dir * 19, feet - 14 + flap * 1.3);
  ink(ctx, 1.8, C.capeDark);

  const seg = (x0, y0, x1, y1, color, w) => {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ink(ctx, w + 2.4);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ink(ctx, w, color);
  };

  const arm = (side) => {
    const sx = cx + side * 7.4;
    const sy = feet - 36 + bob * 0.5;
    const handX = cx + side * 11.5 + dir * (airborne ? 4 : 2);
    const handY = feet - 27 + armSwing * 0.7 + side * swing * 2 + bob * 0.5;
    const ex = (sx + handX) / 2 + side * 0.6;
    const ey = (sy + handY) / 2 + 1.4;

    seg(sx, sy, ex, ey, C.suit, 4.6);
    seg(ex, ey, handX, handY, C.cape, 4.2);

    // punho da luva
    ctx.beginPath();
    ctx.ellipse(ex, ey, 3, 2.4, side * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 1.4);

    // mão enluvada
    ctx.beginPath();
    ctx.arc(handX, handY, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 1.6);
  };

  arm(-dir);

  // pernas do macacão e botas vermelhas
  [-1, 1].forEach((side, i) => {
    const off = side * 4.6 + (i === 0 ? swing : -swing) * 2.4;

    ctx.beginPath();
    rr(ctx, cx + off - 4, feet - 23, 8, 14, 4);
    ctx.fillStyle = C.suit;
    ctx.fill();
    ink(ctx, 2.2);

    ctx.beginPath();
    rr(ctx, cx + off - 4.8, feet - 10.6, 9.8, 10.6, 3.4);
    ctx.fillStyle = C.cape;
    ctx.fill();
    ink(ctx, 2);

    ctx.beginPath();
    rr(ctx, cx + off - 4.8, feet - 10.6, 9.8, 3, 1.4);
    ctx.fillStyle = C.capeDark;
    ctx.fill();
  });

  // tronco do macacão
  ctx.beginPath();
  rr(ctx, cx - 10, feet - 39, 20, 19, 8);
  ctx.fillStyle = C.suit;
  ctx.fill();
  ink(ctx, 2.6);

  ctx.beginPath();
  rr(ctx, cx - 7 + dir * 1.6, feet - 36.4, 7, 11, 4);
  ctx.fillStyle = C.suitLight;
  ctx.fill();

  // cinto utilitário
  ctx.beginPath();
  rr(ctx, cx - 10.4, feet - 26, 20.8, 5.2, 2.2);
  ctx.fillStyle = C.gold;
  ctx.fill();
  ink(ctx, 1.8);

  ctx.beginPath();
  rr(ctx, cx - 2.8, feet - 26.4, 5.6, 6, 1.8);
  ctx.fillStyle = C.goldDark;
  ctx.fill();
  ink(ctx, 1.4);

  // gola e nó da capa
  ctx.beginPath();
  ctx.ellipse(cx, feet - 38.4, 7.2, 3.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = C.cape;
  ctx.fill();
  ink(ctx, 1.7);

  arm(dir);

  // folhas do cálice na base do capulho
  [
    [-7.8, 0.6, -0.75],
    [-2.8, 1.6, -0.25],
    [2.8, 1.6, 0.25],
    [7.8, 0.6, 0.75],
  ].forEach(([dx, dy, rot]) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, headY + 8.2 + dy, 3.5, 2.1, rot, 0, Math.PI * 2);
    ctx.fillStyle = C.leaf;
    ctx.fill();
    ink(ctx, 1.2);
  });

  // cabeça de capulho: silhueta escura e pluma por cima
  const hx = cx + dir * 1.2;
  const puffs = [
    [0, 1.2, 10.2],
    [-6.6, -4.2, 8],
    [6.6, -4.2, 8],
    [0, -8.6, 7.4],
    [-8.2, 3.4, 6.8],
    [8.2, 3.4, 6.8],
  ];
  puffs.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(hx + dx, headY + dy, r + 2.1, 0, Math.PI * 2);
    ctx.fillStyle = '#1B120C';
    ctx.fill();
  });
  puffs.forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(hx + dx, headY + dy, r, 0, Math.PI * 2);
    ctx.fillStyle = C.cotton;
    ctx.fill();
  });

  // sulcos da pluma
  ctx.strokeStyle = C.cottonShade;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(hx - 2.4, headY + 2, 7.6, Math.PI * 1.05, Math.PI * 1.75);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx + 5.4, headY + 2.6, 6, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();

  // rosto determinado
  const fx = hx + dir * 1.6;
  const eyeY = headY - 0.4;
  const blink = Math.sin(t * 1.15) > 0.985;

  [-3.6, 3.6].forEach((dx) => {
    if (blink) {
      ctx.beginPath();
      ctx.moveTo(fx + dx - 2.2, eyeY);
      ctx.lineTo(fx + dx + 2.2, eyeY);
      ink(ctx, 1.8);
      return;
    }
    ctx.beginPath();
    ctx.ellipse(fx + dx, eyeY, 2.1, 2.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ink(ctx, 1.1);
    ctx.beginPath();
    ctx.arc(fx + dx + dir * 0.6, eyeY, 1.3, 0, Math.PI * 2);
    ctx.fillStyle = '#241A12';
    ctx.fill();
  });

  // sobrancelhas decididas
  ctx.beginPath();
  ctx.moveTo(fx - 6.4, eyeY - 6.2);
  ctx.lineTo(fx - 1.8, eyeY - 4.4);
  ink(ctx, 1.9);
  ctx.beginPath();
  ctx.moveTo(fx + 6.4, eyeY - 6.2);
  ctx.lineTo(fx + 1.8, eyeY - 4.4);
  ink(ctx, 1.9);

  // sorriso confiante
  ctx.beginPath();
  ctx.moveTo(fx - 2.6, eyeY + 4.4);
  ctx.quadraticCurveTo(fx + 1.2, eyeY + 6.6, fx + 4.4, eyeY + 4);
  ink(ctx, 1.7);

  ctx.fillStyle = 'rgba(234, 122, 122, 0.35)';
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(fx + side * 6.6, eyeY + 3.6, 2.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
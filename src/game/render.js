import { TILE, VIEW_W, VIEW_H, ROWS } from './config';
import { INK, rr, ink, star, drawCloud, drawBoll, puffCluster } from './brush';
import { drawSceneryProp, drawSurfaceDetail, drawLandmark } from './props';
import { getBackdrop, drawBackdrop } from './backdrop';
import { drawCaipira, drawPunchBurst } from './hero';
import { ART, ART_BASE, getSprite, drawSprite, drawVintageFilter } from './sprites';
import { getCutout } from './cutout';
import { drawPointBoll, drawSpring, drawRollTile } from './cotton';
import { drawGroundCell } from './ground';
import { drawBaleContainer } from './obstacles';
import { drawLabVillain } from './villainSprite';
import { drawFardinho, drawTallFardinho } from './fardinho';
import { drawGinFoe } from './ginFoes';
import { drawWonder } from './wonder';
import { drawBandejaStack } from './bandeja';
import { drawBoss, drawBossHearts } from './boss';
import { drawRopes, drawRopeArt } from './ropes';
import { drawVents } from './vents';
import { drawTutorial } from './tutorial';
import { drawManejoProps, drawManejoFront } from './manejo';
import { drawFinishLine, drawFinale } from './finale';
import { drawThrows } from './throws';
import { drawClockWaves } from './clockFoe';
import { drawAcid } from './acidFoe';
import { drawLabObstacle } from './labObstacles';

function drawHills(ctx, offset, baseY, color, amp, freq) {
  const topY = (x) =>
    baseY - Math.sin((x + offset) * freq) * amp * 0.55 - Math.sin((x + offset) * freq * 2.7 + 1.4) * amp * 0.22;

  ctx.beginPath();
  ctx.moveTo(0, VIEW_H);
  for (let x = 0; x <= VIEW_W; x += 14) ctx.lineTo(x, topY(x));
  ctx.lineTo(VIEW_W, VIEW_H);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, topY(0));
  for (let x = 0; x <= VIEW_W; x += 14) ctx.lineTo(x, topY(x));
  ink(ctx, 3.4);
}

function drawGoal(ctx, x, groundY, time) {
  const wallTop = groundY - 116;
  // shed
  ctx.beginPath();
  ctx.rect(x + 48, wallTop, 108, 116);
  ctx.fillStyle = '#FFF6E0';
  ctx.fill();
  ink(ctx, 3.2);

  // roof
  ctx.beginPath();
  ctx.moveTo(x + 32, wallTop);
  ctx.lineTo(x + 102, wallTop - 56);
  ctx.lineTo(x + 172, wallTop);
  ctx.closePath();
  ctx.fillStyle = '#E81E25';
  ctx.fill();
  ink(ctx, 3.2);

  // door + windows
  ctx.beginPath();
  ctx.rect(x + 86, groundY - 58, 34, 58);
  ctx.fillStyle = '#8B5A39';
  ctx.fill();
  ink(ctx, 2.6);
  [56, 120].forEach((wx) => {
    ctx.beginPath();
    ctx.rect(x + wx, wallTop + 22, 26, 26);
    ctx.fillStyle = '#70C5F1';
    ctx.fill();
    ink(ctx, 2.4);
  });

  // sign
  ctx.beginPath();
  rr(ctx, x + 60, wallTop + 66, 84, 24, 8);
  ctx.fillStyle = '#FFD23F';
  ctx.fill();
  ink(ctx, 2.4);
  ctx.fillStyle = INK;
  ctx.font = '800 14px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('USINA', x + 102, wallTop + 84);
  ctx.textAlign = 'left';

  // pole
  ctx.beginPath();
  ctx.moveTo(x + 4, groundY);
  ctx.lineTo(x + 4, groundY - 190);
  ink(ctx, 8);
  ctx.beginPath();
  ctx.moveTo(x + 4, groundY);
  ctx.lineTo(x + 4, groundY - 190);
  ink(ctx, 3.6, '#8E8E8E');

  // flag
  const w = Math.sin(time * 3) * 7;
  ctx.beginPath();
  ctx.moveTo(x + 8, groundY - 186);
  ctx.quadraticCurveTo(x + 64, groundY - 176 + w, x + 110, groundY - 164);
  ctx.lineTo(x + 110, groundY - 126);
  ctx.quadraticCurveTo(x + 60, groundY - 142 + w, x + 8, groundY - 134);
  ctx.closePath();
  ctx.fillStyle = '#0072BC';
  ctx.fill();
  ink(ctx, 3);

  ctx.beginPath();
  ctx.arc(x + 60, groundY - 156, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ink(ctx, 2.4);
  ctx.beginPath();
  ctx.arc(x + 60, groundY - 156, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#57B24A';
  ctx.fill();
}

export function drawWeevil(ctx, x, y, w, h, t, dir, alert = false) {
  const art = getSprite(ART.weevil);
  if (art) {
    // Bicudo da arte conceitual: anda saltitando e, em alerta, corre inclinado com o bico à frente.
    const cx = x + w / 2;
    const step = Math.abs(Math.sin(t * (alert ? 16 : 9)));
    ctx.fillStyle = 'rgba(27, 18, 12, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx, y + h + 2, w * 0.55, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    const rot = (alert ? 0.12 : 0) + Math.sin(t * 9) * 0.04;
    drawSprite(ctx, art, cx, y + h + 3, w * 1.35, {
      dir,
      rot: rot * dir,
      sx: 1 + step * 0.04,
      sy: 1 - step * 0.06,
      anchorY: 0.97,
    });
    if (alert) {
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = INK;
      ctx.strokeText('!', cx, y - 26);
      ctx.fillStyle = '#FFD23F';
      ctx.fillText('!', cx, y - 26);
    }
    return;
  }
  const cx = x + w / 2;
  const cy = y + h / 2 + 2;

  // legs
  for (let i = -1; i <= 1; i++) {
    const lx = cx + i * 9;
    const wob = Math.sin(t * 10 + i) * 2.5;
    ctx.beginPath();
    ctx.moveTo(lx, cy + 5);
    ctx.lineTo(lx + wob, cy + 16);
    ink(ctx, 3.4);
  }

  // body
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.4, h * 0.38, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8A4E28';
  ctx.fill();
  ink(ctx, 3);

  ctx.beginPath();
  ctx.ellipse(cx - dir * 3, cy + 3, w * 0.24, h * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#B07A50';
  ctx.fill();

  // head
  const hx = cx + dir * w * 0.27;
  const hy = cy - h * 0.18;
  ctx.beginPath();
  ctx.arc(hx, hy, h * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#6F3D22';
  ctx.fill();
  ink(ctx, 2.8);

  // snout
  ctx.beginPath();
  ctx.moveTo(hx + dir * 3, hy - 4);
  ctx.lineTo(hx + dir * 20, hy - 13);
  ink(ctx, 7);
  ctx.beginPath();
  ctx.moveTo(hx + dir * 3, hy - 4);
  ctx.lineTo(hx + dir * 20, hy - 13);
  ink(ctx, 3.2, '#8B5A39');

  // antenna
  ctx.beginPath();
  ctx.moveTo(hx + dir * 2, hy - 6);
  ctx.lineTo(hx + dir * 8, hy - 16);
  ink(ctx, 2);

  // eye + angry brow
  ctx.beginPath();
  ctx.arc(hx + dir * 2, hy - 3, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ink(ctx, 1.8);
  ctx.beginPath();
  ctx.arc(hx + dir * 3, hy - 3, 1.9, 0, Math.PI * 2);
  ctx.fillStyle = '#1B120C';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(hx - dir * 2, hy - 10);
  ctx.lineTo(hx + dir * 6, hy - 6);
  ink(ctx, 2.4);

  // rastro de investida quando o bicudo acelera
  if (alert) {
    ctx.strokeStyle = 'rgba(255, 253, 247, 0.9)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - dir * (w * 0.45), cy - 4 + i * 8);
      ctx.lineTo(cx - dir * (w * 0.45 + 11), cy - 4 + i * 8);
      ctx.stroke();
    }
  }
}

// Mosca-branca: inimigo voador, com asas claras e mergulho na direção do Dão.
export function drawWhitefly(ctx, x, y, w, h, t, mode = 'hover', dir = 1, artUrl = ART.whitefly, scale = 2.6) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const art = getSprite(artUrl);
  if (art) {
    // arte conceitual da mosca-branca: bate as asas (estica no eixo vertical) e inclina no mergulho
    const flapK = Math.sin(t * 22);
    drawSprite(ctx, art, cx, cy - 4, w * scale, {
      dir,
      rot: mode === 'dive' ? 0.28 * dir : Math.sin(t * 3) * 0.06,
      sx: 1 - flapK * 0.03,
      sy: 1 + flapK * 0.07,
    });
    if (mode === 'dive') {
      ctx.beginPath();
      star(ctx, cx - dir * 4, cy - h * 1.15, 4, 6.5, 2.6, t * 5);
      ctx.fillStyle = '#F0273A';
      ctx.fill();
      ink(ctx, 1.8);
    }
    return;
  }
  const flap = 0.45 + Math.abs(Math.sin(t * 15)) * 0.65;

  [-1, 1].forEach((s) => {
    ctx.save();
    ctx.translate(cx, cy - 4);
    ctx.rotate(s * 0.42);
    ctx.beginPath();
    ctx.ellipse(s * 12, -5, 13, 7 * flap, s * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(236, 249, 255, 0.92)';
    ctx.fill();
    ink(ctx, 2.6);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy - 2);
    ctx.rotate(s * 0.62);
    ctx.beginPath();
    ctx.ellipse(s * 8, 6, 9, 5 * flap, s * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(212, 241, 255, 0.88)';
    ctx.fill();
    ink(ctx, 2.2);
    ctx.restore();
  });

  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.moveTo(cx + s * 3, cy - 9);
    ctx.quadraticCurveTo(cx + s * 9, cy - 17, cx + s * 13, cy - 13);
    ink(ctx, 2);
  });

  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, w * 0.26, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#F8F1D4';
  ctx.fill();
  ink(ctx, 3);

  ctx.beginPath();
  ctx.ellipse(cx, cy + h * 0.2, w * 0.17, h * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E4D9A8';
  ctx.fill();

  [-1, 1].forEach((s) => {
    ctx.beginPath();
    ctx.arc(cx + s * 5, cy - h * 0.28, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#F0273A';
    ctx.fill();
    ink(ctx, 1.8);
    ctx.beginPath();
    ctx.arc(cx + s * 5 + 0.7, cy - h * 0.3, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  });

  if (mode === 'dive') {
    ctx.beginPath();
    star(ctx, cx, cy - h * 1.05, 4, 6.5, 2.6, t * 5);
    ctx.fillStyle = '#F0273A';
    ctx.fill();
    ink(ctx, 1.8);
  }
}

function drawCuriosity(ctx, cur, camera, time) {
  const bob = Math.sin(time * 2.4 + cur.x * 0.01) * 5;
  const cx = cur.x - camera;
  const cy = cur.y + bob;

  star(ctx, cx, cy, 8, 25, 15, time * 0.6);
  ctx.fillStyle = 'rgba(255, 210, 63, 0.95)';
  ctx.fill();
  ink(ctx, 2.6);

  ctx.beginPath();
  ctx.arc(cx, cy, 13, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ink(ctx, 2.6);

  // lupa
  ctx.beginPath();
  ctx.arc(cx - 1.5, cy - 2, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#70C5F1';
  ctx.fill();
  ink(ctx, 2);
  ctx.beginPath();
  ctx.moveTo(cx + 2.5, cy + 2);
  ctx.lineTo(cx + 7, cy + 7);
  ink(ctx, 2.6);
}

// Capulho dourado: item raro que dá poder ao Dão.
function drawGolden(ctx, g, camera, time) {
  const gx = g.x - camera;
  const gy = g.y + Math.sin(time * 2.6 + g.phase) * 5;
  const pulse = 1 + Math.sin(time * 4) * 0.06;

  ctx.fillStyle = 'rgba(255, 196, 46, 0.22)';
  ctx.beginPath();
  ctx.arc(gx, gy, 27 * pulse, 0, Math.PI * 2);
  ctx.fill();

  star(ctx, gx, gy, 10, 24 * pulse, 13 * pulse, time * 0.8);
  ctx.fillStyle = 'rgba(255, 214, 63, 0.85)';
  ctx.fill();
  ink(ctx, 2.2);

  ctx.fillStyle = '#C89100';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(gx + Math.cos(a) * 9, gy + Math.sin(a) * 9, 6.4, 4.6, a, 0, Math.PI * 2);
    ctx.fill();
  }
  puffCluster(ctx, gx, gy, [[0, 0, 9.4], [-6.6, 2, 7.4], [6.6, 2, 7.4], [0, -6.6, 7.4], [0, 6.6, 7]], 1, '#FFD24A');
  ctx.fillStyle = '#FFF3B0';
  ctx.beginPath();
  ctx.arc(gx - 3.2, gy - 3.2, 2.6, 0, Math.PI * 2);
  ctx.fill();

  star(ctx, gx + 12, gy - 12, 4, 6, 2.4, time * 3);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
}

function drawKeyGlyph(ctx, kind, x, y) {
  ctx.fillStyle = INK;
  if (kind === 'drop') {
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.quadraticCurveTo(x + 7, y + 1, x + 3.4, y + 5.4);
    ctx.quadraticCurveTo(x, y + 8, x - 3.4, y + 5.4);
    ctx.quadraticCurveTo(x - 7, y + 1, x, y - 8);
    ctx.fillStyle = '#35A9E8';
    ctx.fill();
    ink(ctx, 1.8);
    return;
  }
  if (kind === 'air') {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(x - 7, y + i * 4);
      ctx.quadraticCurveTo(x, y + i * 4 - 4, x + 7, y + i * 4);
      ink(ctx, 2, '#7FC8EE');
    }
    return;
  }
  if (kind === 'sun') {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFB020';
    ctx.fill();
    ink(ctx, 1.6);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7);
      ctx.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10);
      ink(ctx, 1.6);
    }
    return;
  }
  if (kind === 'monitor') {
    ctx.beginPath();
    rr(ctx, x - 8, y - 7, 16, 11, 3);
    ctx.fillStyle = '#9EE6A0';
    ctx.fill();
    ink(ctx, 1.8);
    ctx.beginPath();
    ctx.arc(x, y - 1.5, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = '#2C7A3C';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 6);
    ctx.lineTo(x + 4, y + 6);
    ink(ctx, 2.4);
    return;
  }
  if (kind === 'fiber') {
    puffCluster(
      ctx,
      x,
      y,
      [
        [0, 0, 5.6],
        [-4, 1.4, 4.4],
        [4, 1.4, 4.4],
        [0, -4, 4.4],
      ],
      1,
      '#FFFDF7'
    );
    ink(ctx, 1.6);
    return;
  }
  // solo: camadas de terra com uma muda
  [-3.4, 1.4].forEach((dy, i) => {
    ctx.beginPath();
    rr(ctx, x - 8, y + dy, 16 - i * 5, 3.4, 1.7);
    ctx.fillStyle = i === 0 ? '#A9702F' : '#C98C43';
    ctx.fill();
    ink(ctx, 1.4);
  });
  ctx.beginPath();
  ctx.moveTo(x + 5, y - 3);
  ctx.lineTo(x + 5, y - 8);
  ink(ctx, 1.8, '#3F9A3C');
  ctx.beginPath();
  ctx.ellipse(x + 2, y - 8, 3, 1.8, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#57B24A';
  ctx.fill();
}

// Itens especiais das fases: três por fase, liberam a porteira.
function drawKeyItem(ctx, k, camera, time) {
  if (k.taken) return;
  const x = k.x - camera;
  if (x < -80 || x > VIEW_W + 80) return;
  const y = k.y + Math.sin(time * 2.2 + k.x * 0.01) * 4;
  const pulse = 1 + Math.sin(time * 4 + k.x * 0.02) * 0.06;

  ctx.fillStyle = 'rgba(112, 197, 241, 0.28)';
  ctx.beginPath();
  ctx.arc(x, y, 23 * pulse, 0, Math.PI * 2);
  ctx.fill();

  star(ctx, x, y, 10, 19, 11.5, time * 0.5);
  ctx.fillStyle = '#FFD23F';
  ctx.fill();
  ink(ctx, 2.4);

  ctx.beginPath();
  ctx.arc(x, y, 13.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ink(ctx, 2.2);

  drawKeyGlyph(ctx, k.kind, x, y);

  ctx.font = '800 10px "Baloo 2", system-ui, sans-serif';
  const tw = ctx.measureText(k.label).width + 13;
  ctx.beginPath();
  rr(ctx, x - tw / 2, y + 17, tw, 14, 7);
  ctx.fillStyle = 'rgba(255, 253, 247, 0.94)';
  ctx.fill();
  ink(ctx, 1.8);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText(k.label, x, y + 27.5);
  ctx.textAlign = 'left';
}

// Porteira da usina: só abre com os três itens da fase reunidos.
function drawGate(ctx, x, groundY, open, found, total) {
  const top = groundY - 165;

  [-19, 19].forEach((dx) => {
    ctx.beginPath();
    rr(ctx, x + dx - 6, top, 12, groundY - top, 5);
    ctx.fillStyle = '#8B5A39';
    ctx.fill();
    ink(ctx, 2.8);
  });

  if (open) {
    ctx.fillStyle = 'rgba(120, 220, 130, 0.18)';
    ctx.fillRect(x - 13, top + 12, 26, groundY - top - 12);
    return;
  }

  for (let i = 0; i < 3; i++) {
    const y = top + 30 + i * 46;
    ctx.beginPath();
    rr(ctx, x - 24, y, 48, 16, 6);
    ctx.fillStyle = '#C98550';
    ctx.fill();
    ink(ctx, 2.6);
  }

  // plaquinha do chefão
  ctx.beginPath();
  rr(ctx, x - 34, top - 26, 68, 22, 8);
  ctx.fillStyle = '#B3261E';
  ctx.fill();
  ink(ctx, 2.6);
  ctx.font = '800 13px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFF3D6';
  ctx.fillText('CHEFÃO', x, top - 10);
  ctx.textAlign = 'left';

  // cadeado central
  ctx.beginPath();
  rr(ctx, x - 12, groundY - 96, 24, 20, 6);
  ctx.fillStyle = '#FFC107';
  ctx.fill();
  ink(ctx, 2.4);
  ctx.beginPath();
  ctx.arc(x, groundY - 96, 7, Math.PI, Math.PI * 2);
  ink(ctx, 3);
  ctx.beginPath();
  ctx.arc(x, groundY - 88, 2.4, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();
}

// Ponte de barbante: corda trançada colorida (como na arte conceitual) com postes nas pontas.
const BARBANTE = ['#E8506A', '#FFC93A', '#3FB5C9', '#C77DDA', '#7FD05A'];
function drawFioBridges(ctx, eng) {
  const { level, camera, time } = eng;
  if (level.blockStyle !== 'fio') return;
  // junta as plataformas em trechos contínuos (mesma altura, blocos vizinhos)
  const rows = {};
  (level.platforms ?? []).forEach((p) => {
    if (p.roll) return;
    const row = p.y + (level.rowOffset ?? 0);
    (rows[row] ??= []).push(p.x);
  });
  Object.entries(rows).forEach(([row, xs]) => {
    xs.sort((a, b) => a - b);
    let start = xs[0];
    for (let i = 0; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === xs[i - 1] + 1) continue;
      if (i > 0) drawBarbante(ctx, start * TILE - camera, (xs[i - 1] + 1) * TILE - camera, Number(row) * TILE, time);
      start = xs[i];
    }
  });
}

// Rolos de tecido flutuantes (escada): arte do jogo com brilho suave embaixo, sem tocar o chão.
function drawRollSteps(ctx, eng) {
  const { level, camera, time } = eng;
  const art = getCutout(`${ART_BASE}fiacao-rolo.png`, [0, 0, 1, 1], 'alpha');
  (level.platforms ?? []).forEach((p) => {
    if (!p.roll) return;
    const x = p.x * TILE - camera;
    if (x < -220 || x > VIEW_W + 60) return;
    const top = (p.y + (level.rowOffset ?? 0)) * TILE;
    const w = p.w * TILE + 14;
    const h = art ? w * (art.height / art.width) : 44;
    const bob = Math.sin(time * 2 + p.x) * 1.2;
    ctx.fillStyle = 'rgba(27, 18, 12, 0.14)';
    ctx.beginPath();
    ctx.ellipse(x + (p.w * TILE) / 2, top + h + 12, w * 0.36, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (art) {
      ctx.save();
      ctx.shadowColor = 'rgba(27, 18, 12, 0.4)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetY = 3;
      ctx.drawImage(art, x - 7, top - 4 + bob, w, h);
      ctx.restore();
    }
  });
}

function drawBarbante(ctx, x0, x1, y, time) {
  if (x1 < -40 || x0 > VIEW_W + 40) return;
  const len = x1 - x0;
  const cy = y + 7;
  const sagAt = (t) => Math.sin(Math.PI * t) * 3 + Math.sin(time * 2 + t * 6) * 0.6;
  const yAt = (x) => cy + sagAt((x - x0) / len);
  if (drawRopeArt(ctx, x0 + 2, cy, x1 - 2, cy, 22, 3)) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // contorno + corpo da corda
  for (const [w, col] of [[17, INK], [13, '#F4E3C2']]) {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 6) (x === x0 ? ctx.moveTo(x, yAt(x)) : ctx.lineTo(x, yAt(x)));
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.stroke();
  }
  // tranças: riscos inclinados de cores alternadas
  let k = 0;
  for (let x = x0 + 4; x < x1 - 3; x += 7, k++) {
    ctx.beginPath();
    ctx.moveTo(x - 3, yAt(x) - 5);
    ctx.lineTo(x + 3, yAt(x) + 5);
    ctx.strokeStyle = BARBANTE[k % BARBANTE.length];
    ctx.lineWidth = 4.6;
    ctx.stroke();
  }
  // brilho em cima
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 6) (x === x0 ? ctx.moveTo(x, yAt(x) - 4) : ctx.lineTo(x, yAt(x) - 4));
  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  // postes de madeira com argola de latão nas pontas
  [x0 + 2, x1 - 2].forEach((px) => {
    ctx.beginPath();
    rr(ctx, px - 6, cy - 16, 12, 38, 4);
    ctx.fillStyle = '#B97A44';
    ctx.fill();
    ink(ctx, 2.4);
    ctx.beginPath();
    rr(ctx, px - 7, cy - 18, 14, 9, 3);
    ctx.fillStyle = '#E0A82E';
    ctx.fill();
    ink(ctx, 2.2);
  });
}

export function drawScene(ctx, eng) {
  const { level, camera, time } = eng;
  const th = level.theme;

  ctx.save();

  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, th.skyTop);
  sky.addColorStop(1, th.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(-40, -40, VIEW_W + 80, VIEW_H + 80);

  // halftone comic corner
  ctx.fillStyle = 'rgba(27, 18, 12, 0.10)';
  for (let gy = 12; gy < 200; gy += 22) {
    for (let gx = 12; gx < VIEW_W; gx += 22) {
      const r = 1.4 + (1 - gy / 200) * 1.6;
      ctx.beginPath();
      ctx.arc(gx, gy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // sun
  const sunX = 790 - camera * 0.04;
  star(ctx, sunX, 92, 12, 66, 46, time * 0.2);
  ctx.fillStyle = th.sun;
  ctx.fill();
  ink(ctx, 3);

  // clouds
  for (let i = 0; i < 6; i++) {
    const span = VIEW_W + 340;
    const raw = i * 240 - camera * 0.12 - time * 9;
    const cx = ((raw % span) + span) % span - 170;
    drawCloud(ctx, cx, 54 + ((i * 47) % 110), 0.72 + (i % 3) * 0.2);
  }

  drawHills(ctx, camera * 0.2, VIEW_H - 158, th.hillFar, 130, 0.008);
  drawHills(ctx, camera * 0.36, VIEW_H - 104, th.hillNear, 150, 0.012);
  drawLandmark(ctx, level.scenery?.landmark, camera, VIEW_H - 148, time);

  // cenário ilustrado da fase cobre o fundo desenhado, mantendo o chão jogável por cima
  const backdrop = getBackdrop(level.scenery?.backdrop);
  const pan = (eng.camera ?? 0) / Math.max(1, level.width * TILE - VIEW_W);
  if (backdrop) drawBackdrop(ctx, backdrop, level.scenery?.tint, level.scenery?.fit, level.scenery?.anim, time, pan);

  // chão com textura da lavoura (rola junto com a câmera), no lugar da base de terra desenhada
  const groundTex = getBackdrop(level.scenery?.groundTexture);
  if (groundTex) {
    const gy = level.groundTop * TILE;
    const tw = groundTex.naturalWidth;
    let tx = -(camera % tw);
    while (tx < VIEW_W) {
      ctx.drawImage(groundTex, 0, 0, groundTex.naturalWidth, VIEW_H - gy, tx, gy, tw + 1, VIEW_H - gy);
      tx += tw;
    }
  }

  const isSolid = (tx, ty) => {
    if (tx < 0 || tx >= level.width) return true;
    if (ty < 0 || ty >= ROWS) return false;
    return level.grid[ty][tx] !== 0;
  };

  // tiles
  const startCol = Math.max(0, Math.floor(camera / TILE) - 1);
  const endCol = Math.min(level.width - 1, Math.floor((camera + VIEW_W) / TILE) + 1);
  for (let x = startCol; x <= endCol; x++) {
    for (let y = 0; y < ROWS; y++) {
      const tile = level.grid[y][x];
      if (!tile) continue;
      const sx = Math.round(x * TILE - camera);
      const sy = y * TILE;
      const surface = !isSolid(x, y - 1);

      // Fases com blocos de rolos de algodão: plataformas e obstáculos viram rolos.
      if (level.blockStyle === 'rolo' && (tile === 2 || tile === 3)) {
        const shape = level.rollTops?.[`${x},${y}`];
        if (shape === 'skip') continue;
        drawRollTile(ctx, shape === 'center' ? sx + TILE / 2 : sx, sy, x, y);
        continue;
      }

      if (level.artCells?.has(`${x},${y}`)) continue;
      if (level.blockStyle === 'fio' && tile === 2) continue; // desenhado por drawFioBridges
      if (level.obstacleStyle === 'bandeja' && tile === 3) {
        if (level.grid[y - 1]?.[x] === 3) continue;
        let n = 1;
        while (level.grid[y + n]?.[x] === 3) n++;
        drawBandejaStack(ctx, sx, sy, TILE, n);
        continue;
      }

      // Fardinhos da algodoeira: cada bloco é um fardo prensado desenhado com a arte.
      if (level.obstacleStyle === 'fardinho' && tile === 3) {
        let top = y;
        while (top > 0 && level.grid[top - 1][x] === 3) top--;
        if ((y - top) % 2 === 0) drawTallFardinho(ctx, sx, sy, TILE);
        continue;
      }
      if (level.obstacleStyle === 'fardinho' && tile === 2) {
        drawFardinho(ctx, sx, sy, TILE, TILE);
        continue;
      }

      if (tile === 1 && (groundTex || level.scenery?.hideGround)) {
        // só uma linha de contorno no topo para marcar onde se pisa
        if (surface) {
          ctx.fillStyle = 'rgba(27, 18, 12, 0.55)';
          ctx.fillRect(sx, sy, TILE + 1, 3);
          ctx.fillStyle = 'rgba(150, 220, 90, 0.9)';
          ctx.fillRect(sx, sy + 3, TILE + 1, 3);
        }
        continue;
      }

      if (tile === 1) {
        drawGroundCell(ctx, sx, sy, x, y, th, surface);
        if (surface) drawSurfaceDetail(ctx, sx, sy, level.scenery?.surface, x);
      } else if (tile === 3) {
        drawBaleContainer(
          ctx,
          sx,
          sy,
          level.obstacleStyle,
          level.grid[y][x - 1] === 3,
          level.grid[y][x + 1] === 3,
          level.grid[y - 1]?.[x] === 3,
          level.grid[y + 1]?.[x] === 3
        );
      } else {
        ctx.beginPath();
        rr(ctx, sx + 2, sy + 5, TILE - 4, TILE - 9, 12);
        ctx.fillStyle = '#B4703A';
        ctx.fill();
        ink(ctx, 2.8);
        ctx.beginPath();
        rr(ctx, sx + 2, sy + 5, TILE - 4, 12, 8);
        ctx.fillStyle = th.grass;
        ctx.fill();
        ink(ctx, 2.4);
      }

      // comic edges
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      if (!isSolid(x, y - 1)) {
        ctx.moveTo(sx, sy + 1.5);
        ctx.lineTo(sx + TILE, sy + 1.5);
      }
      if (!isSolid(x, y + 1)) {
        ctx.moveTo(sx, sy + TILE - 1.5);
        ctx.lineTo(sx + TILE, sy + TILE - 1.5);
      }
      if (!isSolid(x - 1, y)) {
        ctx.moveTo(sx + 1.5, sy);
        ctx.lineTo(sx + 1.5, sy + TILE);
      }
      if (!isSolid(x + 1, y)) {
        ctx.moveTo(sx + TILE - 1.5, sy);
        ctx.lineTo(sx + TILE - 1.5, sy + TILE);
      }
      ctx.stroke();
    }
  }

  // obstáculos ilustrados (carrinho de rolos, máquina HVI)
  (level.artObstacles ?? []).forEach((o) => {
    const ox = o.x * TILE - camera;
    if (ox > VIEW_W + 20 || ox + o.w * TILE < -20) return;
    drawLabObstacle(ctx, o, camera, level.groundTop * TILE, TILE);
  });

  // pit shading
  (level.pits ?? []).forEach((pit) => {
    const px = pit.x * TILE - camera;
    if (px > VIEW_W || px + pit.w * TILE < 0) return;
    const top = level.groundTop * TILE;
    const pw = pit.w * TILE;
    // buraco bem escuro e fundo, com faixa de aviso amarela/vermelha piscando na borda
    const grad = ctx.createLinearGradient(0, top, 0, VIEW_H);
    const fio = level.id === 'fiacao';
    grad.addColorStop(0, fio ? '#1B1008' : '#0B0604');
    grad.addColorStop(1, fio ? '#2F1A0C' : '#2A1406');
    ctx.fillStyle = grad;
    ctx.fillRect(px, top, pw, VIEW_H - top);
    if (fio) {
      // vão da fiação: só um fundo escuro e suave, sem faixa de perigo
      const sh = ctx.createLinearGradient(0, top, 0, top + 40);
      sh.addColorStop(0, 'rgba(0,0,0,0.35)');
      sh.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sh;
      ctx.fillRect(px, top, pw, 40);
      return;
    }
    const glow = 0.55 + Math.sin(time * 6) * 0.25;
    const halo = ctx.createLinearGradient(0, top, 0, top + 70);
    halo.addColorStop(0, fio ? `rgba(190, 110, 255, ${glow})` : `rgba(255, 90, 40, ${glow})`);
    halo.addColorStop(1, fio ? 'rgba(190, 110, 255, 0)' : 'rgba(255, 90, 40, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(px, top, pw, 70);
    ctx.save();
    ctx.beginPath();
    ctx.rect(px - 6, top - 6, pw + 12, 10);
    ctx.clip();
    for (let s = -12; s < pw + 24; s += 16) {
      ctx.fillStyle = (s / 16) % 2 === 0 ? '#FFD23F' : '#F0273A';
      ctx.beginPath();
      ctx.moveTo(px - 6 + s, top + 4);
      ctx.lineTo(px - 6 + s + 8, top - 6);
      ctx.lineTo(px - 6 + s + 16, top - 6);
      ctx.lineTo(px - 6 + s + 8, top + 4);
      ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(px, level.groundTop * TILE);
    ctx.lineTo(px, VIEW_H);
    ctx.moveTo(px + pit.w * TILE, level.groundTop * TILE);
    ctx.lineTo(px + pit.w * TILE, VIEW_H);
    ctx.stroke();
  });

  drawFioBridges(ctx, eng);
  drawRollSteps(ctx, eng);

  // decorations
  level.decor.forEach((d) => {
    const dx = d.x * TILE + TILE / 2 - camera;
    if (dx < -80 || dx > VIEW_W + 80) return;
    drawSceneryProp(ctx, d.kind, dx, level.groundTop * TILE, d.x);
  });

  // goal
  const gx = level.goalX * TILE - camera;

  // curiosities
  (eng.curiosities ?? []).forEach((c) => {
    if (c.taken) return;
    const cx = c.x - camera;
    if (cx < -50 || cx > VIEW_W + 50) return;
    drawCuriosity(ctx, c, camera, time);
  });

  // bolls
  eng.bolls.forEach((b) => {
    if (b.taken) return;
    const bx = b.x - camera;
    if (bx < -40 || bx > VIEW_W + 40) return;
    const by = b.y + Math.sin(time * 3 + b.x * 0.012) * 4;
    drawPointBoll(ctx, bx, by, time, 0.9, b.x * 0.013);
  });

  // capulhos dourados (poder)
  (eng.goldens ?? []).forEach((g) => {
    if (g.taken) return;
    const gx = g.x - camera;
    if (gx < -60 || gx > VIEW_W + 60) return;
    drawGolden(ctx, g, camera, time);
  });

  // itens especiais da fase
  (level.keys ?? []).forEach((k) => drawKeyItem(ctx, k, camera, time));

  // capulhos de bônus saindo dos blocos quebrados
  (eng.bonuses ?? []).forEach((b) => {
    const bx = b.x - camera;
    if (bx < -40 || bx > VIEW_W + 40) return;
    drawPointBoll(ctx, bx, b.y, time, 1.1, b.t);
  });

  // capulhos-mola (super pulo)
  (eng.springs ?? []).forEach((sp) => {
    const sx = sp.x - camera;
    if (sx < -60 || sx > VIEW_W + 60) return;
    drawSpring(ctx, sx, sp.y, sp.squash, time);
  });

  drawWonder(ctx, eng);
  drawManejoProps(ctx, eng);

  // enemies
  eng.enemies.forEach((e) => {
    if (e.dead && e.deadT > 24) return;
    const ex = e.x - camera;
    if (ex < -100 || ex > VIEW_W + 100) return;
    if (e.dead) {
      ctx.globalAlpha = Math.max(0, 1 - e.deadT / 24);
      ctx.save();
      ctx.translate(0, 10);
    }
    const dir = e.vx >= 0 ? 1 : -1;
    if (e.type === 'whitefly') {
      if (e.skin === 'traca') drawWhitefly(ctx, ex, e.y, e.w, e.h, e.t, e.mode, dir, ART.traca, 2.3);
      else drawWhitefly(ctx, ex, e.y, e.w, e.h, e.t, e.mode, dir);
    } else if (e.skin && drawGinFoe(ctx, e.skin, ex, e.y, e.w, e.h, e.t, dir, e.alert)) {
      // inimigos da algodoeira
    } else if (level.id === 'laboratorio' && drawLabVillain(ctx, ex, e.y, e.w, e.h, e.t, dir, e.alert)) {
      // vilão próprio do laboratório
    } else {
      drawWeevil(ctx, ex, e.y, e.w, e.h, e.t, dir, e.alert);
    }
    if (e.dead) {
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  });

  drawRopes(ctx, eng);
  drawVents(ctx, eng);
  drawClockWaves(ctx, eng);
  drawAcid(ctx, eng);
  drawBoss(ctx, eng);
  drawBossHearts(ctx, eng);
  drawFinale(ctx, eng);
  drawCaipira(ctx, eng);
  drawThrows(ctx, eng);
  drawTutorial(ctx, eng);
  drawManejoFront(ctx, eng);

  // "POW!" onde o soco acertou
  (eng.pows ?? []).forEach((w) => {
    const k = 1 - w.t / 22;
    const px = w.x - camera;
    drawPunchBurst(ctx, px, w.y - w.t * 0.8, 0.6 + k * 0.8, time);
    ctx.save();
    ctx.globalAlpha = Math.min(1, k * 1.6);
    ctx.font = '900 20px "Trebuchet MS", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1B120C';
    ctx.strokeText('POW!', px, w.y - 26 - w.t * 1.2);
    ctx.fillStyle = '#F0273A';
    ctx.fillText('POW!', px, w.y - 26 - w.t * 1.2);
    ctx.restore();
  });

  // particles: terra, folhas, algodão, orvalho e pólen de fundo
  eng.particles.forEach((pt) => {
    const px = pt.x - camera;
    if (px < -50 || px > VIEW_W + 50) return;
    ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / pt.max));
    ctx.fillStyle = pt.color;

    if (pt.kind === 'leaf') {
      ctx.save();
      ctx.translate(px, pt.y);
      ctx.rotate(pt.rot ?? 0);
      ctx.beginPath();
      ctx.ellipse(0, 0, pt.r * 1.6, pt.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(px, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
      if (pt.kind === 'fluff') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(px - pt.r * 0.35, pt.y - pt.r * 0.35, pt.r * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.globalAlpha = 1;

  // comic bottom tint
  const tint = ctx.createLinearGradient(0, VIEW_H - 100, 0, VIEW_H);
  tint.addColorStop(0, 'rgba(27,18,12,0)');
  tint.addColorStop(1, 'rgba(27,18,12,0.16)');
  ctx.fillStyle = tint;
  ctx.fillRect(0, VIEW_H - 100, VIEW_W, 100);

  // acabamento de desenho animado antigo (granulado + vinheta)
  drawVintageFilter(ctx, VIEW_W, VIEW_H, time);

  ctx.restore();
}
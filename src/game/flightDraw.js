import { VIEW_W, VIEW_H } from './config';
import { INK, rr, ink, star, puffCluster } from './brush';
import { ART, getSprite, drawSprite, drawVintageFilter } from './sprites';
import { drawPointBoll } from './cotton';
import { drawFlightSky, drawNearClouds } from './flightSky';
import { GROUND_Y, drawGroundObstacles, drawCottonRows } from './flightGround';
import { drawHiddenBugs, drawSprayFront, drawFlightHelp, outlinedText } from './flightSpray';


const PLANE_W = 170;
// ponto do nariz (onde gira a hélice) dentro da arte do avião
const NOSE = { x: 0.95, y: 0.48 };
// nariz do aviãozinho do Barão (ele voa para a esquerda)
const BOSS_NOSE = { x: 0.16, y: 0.84 };

function drawPropeller(ctx, x, y, h, time) {
  // vista de lado: as pás giram como uma barra que encolhe e estica, com o disco borrado
  ctx.fillStyle = 'rgba(60, 60, 70, 0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y, 7, h, 0, 0, Math.PI * 2);
  ctx.fill();
  const a = time * 55;
  for (let i = 0; i < 2; i++) {
    const k = Math.cos(a + i * Math.PI * 0.5);
    ctx.fillStyle = `rgba(40, 40, 46, ${0.35 + Math.abs(k) * 0.4})`;
    ctx.beginPath();
    ctx.ellipse(x + 1, y - (k * h) / 2, 3.2, Math.abs(k) * h * 0.5 + 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x + 2, y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#C9CED6';
  ctx.fill();
  ink(ctx, 1.6);
}

function drawPlane(ctx, fl, time, power) {
  const pl = fl.plane;
  // fumacinha do escapamento
  fl.puffs.forEach((p) => {
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - p.t / 30)})`;
    ctx.beginPath();
    ctx.arc(p.x - p.t * 3, p.y + Math.sin(p.t * 0.3) * 2, 4 + p.t * 0.3, 0, Math.PI * 2);
    ctx.fill();
  });
  if (pl.invuln > 0 && Math.floor(pl.invuln / 5) % 2 === 0) return;
  const art = getSprite(ART.aviao);
  const cx = pl.x + pl.w / 2;
  const cy = pl.y + pl.h / 2 + Math.sin(time * 5) * 2.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(pl.tilt);
  if (power > 0) {
    // capulho dourado: aura dourada em volta do avião
    const g = ctx.createRadialGradient(0, 0, 20, 0, 0, 110);
    g.addColorStop(0, 'rgba(255, 214, 80, 0.45)');
    g.addColorStop(1, 'rgba(255, 214, 80, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 70, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (art) {
    const h = (PLANE_W * art.naturalHeight) / art.naturalWidth;
    const ox = -PLANE_W * 0.52;
    const oy = -h * 0.55;
    ctx.drawImage(art, ox, oy, PLANE_W, h);
    drawPropeller(ctx, ox + PLANE_W * NOSE.x, oy + h * NOSE.y, h * 0.42, time);
  } else {
    rr(ctx, -pl.w / 2, -pl.h / 2, pl.w, pl.h, 14);
    ctx.fillStyle = '#FFC41F';
    ctx.fill();
    ink(ctx, 3);
  }
  ctx.restore();
}

function drawShots(ctx, fl, time) {
  // jato de algodão: rastro amarelo e contorno escuro para não se confundir com as nuvens
  fl.shots.forEach((s) => {
    ctx.strokeStyle = 'rgba(255, 200, 60, 0.75)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x - 26, s.y - s.vy * 2.2);
    ctx.lineTo(s.x - 6, s.y);
    ctx.stroke();
    puffCluster(ctx, s.x, s.y, [[0, 0, 7], [-6, 1, 5], [-11, 0, 3.5]], 1, '#FFFDF7');
    ctx.fillStyle = '#FFE95A';
    ctx.beginPath();
    ctx.arc(s.x + 3, s.y - 1, 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
  fl.foeShots.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, 7 + Math.sin(time * 20) * 1, 0, Math.PI * 2);
    ctx.fillStyle = s.c;
    ctx.fill();
    ink(ctx, 2);
  });
}

const FOE_ART = { mosca: 'whitefly', traca: 'mariposa', bicudo: 'weevil', percevejo: 'percevejo' };
const FOE_SCALE = { mosca: 2.2, traca: 1.9, bicudo: 1.4, percevejo: 1.7 };

function drawStorm(ctx, f, time) {
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const art = getSprite(ART.tempestade);
  if (f.bolt > 0 && f.bolt < 30 && Math.floor(f.bolt / 4) % 2 === 0) {
    ctx.fillStyle = 'rgba(255, 230, 80, 0.25)';
    ctx.fillRect(cx - 16, f.y + f.h, 32, GROUND_Y - f.y - f.h);
  }
  if (f.bolt > 30 && f.bolt < 60) {
    ctx.beginPath();
    let y = f.y + f.h - 10;
    ctx.moveTo(cx, y);
    while (y < GROUND_Y) {
      y += 24;
      ctx.lineTo(cx + (Math.random() - 0.5) * 30, y);
    }
    ctx.lineWidth = 9;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFE95A';
    ctx.stroke();
  }
  // sombra de chuva leve embaixo da nuvem
  ctx.fillStyle = 'rgba(70, 80, 110, 0.12)';
  ctx.fillRect(f.x + 20, f.y + f.h - 6, f.w - 40, 40);
  if (art) drawSprite(ctx, art, cx, cy, f.w * 1.15, { dir: 1, sy: 1 + Math.sin(time * 3) * 0.03 });
  else {
    puffCluster(ctx, cx, cy, [[0, 0, 34], [-40, 8, 26], [40, 8, 28], [-18, -18, 26], [22, -16, 24]], 1, '#6E6A80');
  }
}

function drawFoe(ctx, f, time) {
  if (f.t < 0) return;
  if (f.kind === 'tempestade') {
    drawStorm(ctx, f, time);
    return;
  }
  const cx = f.x + f.w / 2;
  const cy = f.y + f.h / 2;
  const art = getSprite(ART[FOE_ART[f.kind]]);
  if (f.kind === 'bicudo') {
    // asinhas batendo para o bicudo voar
    [-1, 1].forEach((s) => {
      ctx.fillStyle = 'rgba(230, 248, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(cx + s * 8, f.y + 4, 16, 7 * Math.abs(Math.sin(time * 30)) + 2, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ink(ctx, 1.6);
    });
  }
  if (f.kind === 'percevejo' && f.dash) {
    // risquinhos de velocidade quando investe
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(f.x + f.w + 6, f.y + 10 + i * 12);
      ctx.lineTo(f.x + f.w + 30, f.y + 10 + i * 12);
      ctx.stroke();
    }
  }
  if (art) {
    const flap = Math.sin(time * 22 + f.x * 0.01);
    ctx.save();
    if (f.flash > 0) ctx.filter = 'brightness(2.2)';
    // a mariposa é desenhada de frente: bate as asas esticando na horizontal
    const opts = f.kind === 'traca'
      ? { dir: 1, sx: 1 - Math.abs(flap) * 0.25, sy: 1 }
      : { dir: -1, sx: 1 - flap * 0.03, sy: 1 + flap * 0.06 };
    drawSprite(ctx, art, cx, cy, f.w * FOE_SCALE[f.kind], opts);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, f.w / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#8B6B3E';
    ctx.fill();
    ink(ctx, 2);
  }
}

function drawBoss(ctx, b, time) {
  if (!b) return;
  const art = getSprite(ART.barao);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2 + Math.sin(time * 4) * 3;
  const w = b.w * 1.35;
  ctx.save();
  if (b.flash > 0) ctx.filter = 'brightness(2)';
  if (art) {
    const h = drawSprite(ctx, art, cx, cy, w, { rot: b.rot ?? Math.sin(time * 1.5) * 0.04 });
    if (!b.dead) {
      ctx.filter = 'none';
      drawPropeller(ctx, cx - w / 2 + w * BOSS_NOSE.x - 6, cy - h / 2 + h * BOSS_NOSE.y, h * 0.2, time);
    }
  } else {
    rr(ctx, b.x, b.y, b.w, b.h, 30);
    ctx.fillStyle = '#7E4BA8';
    ctx.fill();
    ink(ctx, 3);
  }
  ctx.restore();
  if (b.dead) return;
  // nome do vilão logo acima da barra de vida
  const bw = 320;
  const bx = (VIEW_W - bw) / 2;
  ctx.font = '900 16px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.strokeText('BARÃO BICUDO', VIEW_W / 2, 26);
  ctx.fillStyle = '#FFD23F';
  ctx.fillText('BARÃO BICUDO', VIEW_W / 2, 26);
  ctx.textAlign = 'left';
  rr(ctx, bx, 34, bw, 14, 7);
  ctx.fillStyle = '#3A2A0E';
  ctx.fill();
  rr(ctx, bx + 2, 36, (bw - 4) * (b.hp / b.max), 10, 5);
  ctx.fillStyle = '#F0273A';
  ctx.fill();
  rr(ctx, bx, 34, bw, 14, 7);
  ink(ctx, 2.6);
}

function drawPickups(ctx, fl, time) {
  fl.items.forEach((it) => it.live && !it.taken && drawPointBoll(ctx, it.x, it.y + Math.sin(time * 3 + it.at) * 4, time, 0.9, it.at));
  fl.goldens.forEach((it) => {
    if (!it.live || it.taken) return;
    // capulho dourado: estrela laranja grande com "x3" (tiro triplo e escudo)
    const pulse = 1 + Math.sin(time * 6) * 0.08;
    const g = ctx.createRadialGradient(it.x, it.y, 8, it.x, it.y, 44);
    g.addColorStop(0, 'rgba(255, 150, 40, 0.55)');
    g.addColorStop(1, 'rgba(255, 150, 40, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(it.x, it.y, 44, 0, Math.PI * 2);
    ctx.fill();
    star(ctx, it.x, it.y, 5, 27 * pulse, 13 * pulse, time * 1.5);
    ctx.fillStyle = '#FF9A1F';
    ctx.fill();
    ink(ctx, 2.6);
    outlinedText(ctx, 'x3', it.x, it.y + 6, 15, '#FFFFFF');
  });
  fl.facts.forEach((it) => {
    if (!it.live || it.taken) return;
    star(ctx, it.x, it.y, 8, 24, 14, time * 0.6);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    ink(ctx, 2.6);
    ctx.font = '900 18px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.fillText('?', it.x, it.y + 6);
    ctx.textAlign = 'left';
  });
}

function drawBooms(ctx, fl) {
  fl.booms.forEach((b) => {
    const k = b.t / 36;
    ctx.globalAlpha = 1 - k;
    star(ctx, b.x, b.y, 9, (20 + k * 50) * b.s * 1.6, (10 + k * 26) * b.s * 1.6, b.t * 0.1);
    ctx.fillStyle = k < 0.4 ? '#FFE95A' : '#FFFDF7';
    ctx.fill();
    ink(ctx, 2);
    ctx.globalAlpha = 1;
  });
}

function bigText(ctx, text, y, size, fill) {
  ctx.font = `900 ${size}px "Baloo 2", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = size / 5.5;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.strokeText(text, VIEW_W / 2, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, VIEW_W / 2, y);
  ctx.textAlign = 'left';
}

export function drawFlight(ctx, eng) {
  const fl = eng.fl;
  const t = eng.time;
  ctx.save();
  if (eng.shake) ctx.translate((Math.random() - 0.5) * eng.shake, (Math.random() - 0.5) * eng.shake);
  drawFlightSky(ctx, fl, t);
  drawGroundObstacles(ctx, fl);
  drawHiddenBugs(ctx, fl, t);
  drawCottonRows(ctx, fl.dist);
  drawPickups(ctx, fl, t);
  drawSprayFront(ctx, fl, t);
  fl.foes.forEach((f) => drawFoe(ctx, f, t));
  drawBoss(ctx, fl.boss, t);
  drawShots(ctx, fl, t);
  drawPlane(ctx, fl, t, eng.power);
  drawBooms(ctx, fl);
  drawNearClouds(ctx, fl, t);
  drawFlightHelp(ctx, fl, t);
  // aviso de largada e chegada do chefão
  if (fl.dist < 260) {
    ctx.globalAlpha = Math.min(1, (260 - fl.dist) / 80);
    bigText(ctx, 'DECOLAR!', VIEW_H * 0.3, 40, '#FFD23F');
    ctx.globalAlpha = 1;
  }
  if (fl.boss && !fl.boss.dead && fl.boss.t < 120 && Math.floor(fl.boss.t / 12) % 2 === 0) {
    bigText(ctx, 'CUIDADO: BARÃO BICUDO!', VIEW_H * 0.3, 34, '#F0273A');
  }
  if (fl.boss?.dead && fl.winT > 40) {
    bigText(ctx, 'MISSÃO CUMPRIDA!', VIEW_H * 0.3, 44, '#FFD23F');
  }
  drawVintageFilter(ctx, VIEW_W, VIEW_H, t);
  ctx.restore();
}

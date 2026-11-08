import { INK, ink, rr, star, hash, puffCluster, drawCloud } from '@/game/brush';
import { STAGE } from './config';

export function drawSky(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, STAGE.ground);
  g.addColorStop(0, '#86D6F5');
  g.addColorStop(1, '#DCF6FF');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, STAGE.w, STAGE.h);
}

export function drawSun(ctx, t) {
  const cx = 176;
  const cy = 98;
  star(ctx, cx, cy, 12, 64 + Math.sin(t * 1.1) * 2, 45, t * 0.05);
  ctx.fillStyle = '#FFD23F';
  ctx.fill();
  ink(ctx, 3);

  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fillStyle = '#FFE474';
  ctx.fill();
  ink(ctx, 3);

  [-10, 10].forEach((dx) => {
    ctx.beginPath();
    ctx.ellipse(cx + dx, cy - 5, 3.2, 4.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.arc(cx, cy + 3, 11, 0.3, Math.PI - 0.3);
  ink(ctx, 3);
  [-19, 19].forEach((dx) => {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + 6, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(240,120,110,0.45)';
    ctx.fill();
  });
}

export function drawClouds(ctx, t) {
  for (let i = 0; i < 4; i++) {
    const span = STAGE.w + 360;
    const raw = i * 320 + t * (11 + i * 3.5);
    const x = (raw % span) - 180;
    drawCloud(ctx, x, 58 + ((i * 57) % 118), 0.6 + (i % 3) * 0.16);
  }
}

function hillPath(ctx, amp, freq, base, phase) {
  ctx.beginPath();
  ctx.moveTo(-12, STAGE.ground + 40);
  for (let x = -12; x <= STAGE.w + 12; x += 16) {
    const y =
      base - Math.sin(x * freq + phase) * amp - Math.sin(x * freq * 2.6 + 1.7) * amp * 0.24;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(STAGE.w + 12, STAGE.ground + 40);
  ctx.closePath();
}

export function drawHills(ctx) {
  hillPath(ctx, 54, 0.0075, STAGE.ground - 52, 0.8);
  ctx.fillStyle = '#8FE06B';
  ctx.fill();
  ink(ctx, 3, 'rgba(27,18,12,0.45)');

  hillPath(ctx, 42, 0.011, STAGE.ground - 12, 2.4);
  ctx.fillStyle = '#5FCB52';
  ctx.fill();
  ink(ctx, 3);
}

export function drawBarn(ctx) {
  const x = 78;
  const w = 76;

  ctx.beginPath();
  ctx.ellipse(x + w / 2, STAGE.ground + 8, 148, 64, 0, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#7BD55E';
  ctx.fill();
  ink(ctx, 3, 'rgba(27,18,12,0.45)');

  const base = STAGE.ground - 8;
  const h = 50;

  ctx.beginPath();
  rr(ctx, x, base - h, w, h, 6);
  ctx.fillStyle = '#C98A5A';
  ctx.fill();
  ink(ctx, 2.6);

  ctx.beginPath();
  ctx.moveTo(x - 9, base - h);
  ctx.lineTo(x + w / 2, base - h - 34);
  ctx.lineTo(x + w + 9, base - h);
  ctx.closePath();
  ctx.fillStyle = '#B5482F';
  ctx.fill();
  ink(ctx, 2.6);

  ctx.beginPath();
  rr(ctx, x + w / 2 - 12, base - 28, 24, 28, 4);
  ctx.fillStyle = '#7A4A2A';
  ctx.fill();
  ink(ctx, 2);

  ctx.beginPath();
  rr(ctx, x + 12, base - h + 10, 16, 13, 4);
  ctx.fillStyle = '#9ED8F2';
  ctx.fill();
  ink(ctx, 2);
}

export function drawCottonField(ctx, t) {
  for (let i = 0; i < 9; i++) {
    const x = 700 + i * 27 + (hash(i * 4.3) * 10 - 5);
    const sway = Math.sin(t * 1.25 + i * 0.8) * 2.6;
    const topY = STAGE.ground - 48 - (i % 3) * 9;

    ctx.beginPath();
    ctx.moveTo(x, STAGE.ground + 8);
    ctx.quadraticCurveTo(x + sway * 0.6, (STAGE.ground + topY) / 2, x + sway, topY);
    ink(ctx, 3, '#3E8F3B');

    ctx.beginPath();
    ctx.ellipse(x + sway - 7, topY + 13, 8.5, 5, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#49B24A';
    ctx.fill();
    ink(ctx, 1.8);
    ctx.beginPath();
    ctx.ellipse(x + sway + 7, topY + 17, 7.5, 4.4, 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#49B24A';
    ctx.fill();
    ink(ctx, 1.8);

    puffCluster(ctx, x + sway, topY - 2, [[0, 0, 8], [-6, 3, 6], [6, 3, 6], [0, -6, 6]], 1, '#FFFDF7');
  }
}

export function drawGround(ctx) {
  ctx.beginPath();
  ctx.rect(0, STAGE.ground, STAGE.w, STAGE.h - STAGE.ground);
  ctx.fillStyle = '#A97C4D';
  ctx.fill();

  ctx.beginPath();
  ctx.rect(0, STAGE.ground + 64, STAGE.w, STAGE.h - STAGE.ground - 64);
  ctx.fillStyle = '#96693C';
  ctx.fill();

  ctx.beginPath();
  ctx.rect(0, STAGE.ground, STAGE.w, 30);
  ctx.fillStyle = '#76D650';
  ctx.fill();

  for (let x = 12; x < STAGE.w; x += 34) {
    ctx.beginPath();
    ctx.arc(x, STAGE.ground + 30, 12, 0, Math.PI);
    ctx.fillStyle = '#76D650';
    ctx.fill();
    ink(ctx, 2.4);
  }

  for (let i = 0; i < 70; i++) {
    const px = hash(i * 2.7) * STAGE.w;
    const py = STAGE.ground + 62 + hash(i * 5.1) * (STAGE.h - STAGE.ground - 74);
    ctx.beginPath();
    ctx.arc(px, py, 2 + hash(i * 9.3) * 2.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(120,80,44,0.45)';
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(0, STAGE.ground);
  ctx.lineTo(STAGE.w, STAGE.ground);
  ink(ctx, 4);
}

export function drawGrassBlock(ctx, b, i) {
  ctx.beginPath();
  rr(ctx, b.x + 7, b.y + 11, b.w, b.h - 6, 22);
  ctx.fillStyle = 'rgba(27,18,12,0.13)';
  ctx.fill();

  ctx.beginPath();
  rr(ctx, b.x, b.y, b.w, b.h, 22);
  ctx.fillStyle = '#A97C4D';
  ctx.fill();
  ink(ctx, 3.4);

  const speck = Math.max(6, b.h - 66);
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    ctx.arc(
      b.x + 20 + hash(i * 7 + k) * (b.w - 40),
      b.y + 46 + hash(i * 13 + k * 3) * speck,
      2.4 + hash(k + i) * 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(120,80,44,0.5)';
    ctx.fill();
  }

  ctx.beginPath();
  rr(ctx, b.x, b.y, b.w, 32, 16);
  ctx.fillStyle = '#76D650';
  ctx.fill();
  ink(ctx, 3.4);

  for (let k = 0; k < 4; k++) {
    const gx = b.x + 20 + k * ((b.w - 40) / 3);
    ctx.beginPath();
    ctx.arc(gx, b.y + 32, 9, 0, Math.PI);
    ctx.fillStyle = '#76D650';
    ctx.fill();
    ink(ctx, 2.6);
  }

  ctx.beginPath();
  ctx.ellipse(b.x + b.w * 0.32, b.y + 12, b.w * 0.16, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fill();
}
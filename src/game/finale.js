import { TILE, VIEW_W, VIEW_H } from './config';
import { INK, rr } from './brush';
import { drawPointBoll } from './cotton';
import { sceneBales, sceneShip } from './finaleScenes';
import { ART, getSprite } from './sprites';

// Animações de final de fase: linha de chegada, dancinha do Dão e uma cena por fase.
export const FINALE_FRAMES = 420;

// Linha de chegada (substitui a usina): mastro com faixa quadriculada.
export function drawFinishLine(ctx, x, groundY, time) {
  const top = groundY - 190;
  [0, 120].forEach((dx) => {
    ctx.beginPath();
    rr(ctx, x + dx - 5, top, 10, groundY - top, 4);
    ctx.fillStyle = '#8E8E8E';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
  const wave = Math.sin(time * 3) * 4;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = (i + j) % 2 ? '#1B120C' : '#FFFDF7';
      ctx.fillRect(x + 5 + i * 13.75, top + 8 + j * 14 + Math.sin(time * 3 + i) * 2, 13.75, 14);
    }
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x + 5, top + 8 + wave * 0, 110, 28);
  ctx.font = '900 16px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeText('CHEGADA', x + 60, top - 6);
  ctx.fillStyle = '#FFD23F';
  ctx.fillText('CHEGADA', x + 60, top - 6);
  ctx.textAlign = 'left';
}

// A faixa de vitória entra primeiro; depois o Dão dança.
export const DANCE_START = 45;

// Comemoração do Dão: joia e piscadinha.
export function updateDance(eng) {
  const f = eng.finale;
  const p = eng.player;
  f.t++;
  p.vx = 0;
  p.face = 1;
  p.onGround = true;
  p.punchT = 0;
  p.throwT = 0;
  p.invuln = 0;
  // O Dão fica parado no chão dando joia e piscando (quadros do GIF, ver hero.js)
  p.y += (f.baseY - p.y) * 0.2;
  p.dance = { joia: true, t: Math.max(0, f.t - DANCE_START) };
  if (f.t >= FINALE_FRAMES && !f.done) {
    f.done = true;
    eng.hooks.onWin?.(f.result);
  }
}

function confetti(ctx, t) {
  const colors = ['#F0273A', '#FFD23F', '#3F9A3C', '#0072BC', '#FFFDF7'];
  for (let i = 0; i < 40; i++) {
    const x = (i * 97 + t * (1 + (i % 3))) % VIEW_W;
    const y = ((i * 53 + t * (2 + (i % 4))) % (VIEW_H + 40)) - 20;
    ctx.fillStyle = colors[i % 5];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 0.1 + i);
    ctx.fillRect(-4, -2, 8, 4);
    ctx.restore();
  }
}

function banner(ctx, text, sub, k) {
  ctx.save();
  ctx.globalAlpha = k;
  const w = 460;
  const x = VIEW_W / 2 - w / 2;
  const y = 70 - (1 - k) * 30;
  ctx.beginPath();
  rr(ctx, x, y, w, 76, 22);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#244A22';
  ctx.font = '900 30px "Baloo 2", system-ui, sans-serif';
  ctx.fillText(text, VIEW_W / 2, y + 38);
  ctx.fillStyle = '#7A6642';
  ctx.font = '800 15px "Nunito", system-ui, sans-serif';
  ctx.fillText(sub, VIEW_W / 2, y + 62);
  ctx.restore();
}

// Fase 1: chuva de capulhos colhidos.
function sceneHarvest(ctx, t, time) {
  for (let i = 0; i < 14; i++) {
    const x = 60 + ((i * 71) % (VIEW_W - 120));
    const y = Math.min(VIEW_H - 120, -40 + ((t * 3 + i * 37) % (VIEW_H + 60)));
    drawPointBoll(ctx, x, y, time, 1.1, i);
  }
}

// Fase 5: o selo ABR (Algodão Brasileiro Responsável) desce girando, quica e fica
// brilhando com raios de luz e estrelinhas.
function sceneSeal(ctx, t, time) {
  const img = getSprite(ART.seloAbr);
  const k = Math.min(1, Math.max(0, (t - 20) / 40));
  if (k <= 0 || !img) return;
  const e = 1 - Math.pow(1 - k, 3);
  const bt = Math.max(0, t - 60);
  const bounce = k < 1 ? 0 : Math.abs(Math.sin(Math.min(1, bt / 30) * Math.PI)) * 16 * Math.max(0, 1 - bt / 30);
  const cx = VIEW_W * 0.7;
  const cy = 300 - (1 - e) * 360 - bounce;
  const S = 250 * (1 + Math.sin(time * 2.4) * 0.02 * e);
  // raios de luz girando
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.4);
  for (let i = 0; i < 14; i++) {
    ctx.rotate((Math.PI * 2) / 14);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(S * 1.1, -18);
    ctx.lineTo(S * 1.1, 18);
    ctx.closePath();
    ctx.fillStyle = `rgba(255, 228, 120, ${0.24 * e})`;
    ctx.fill();
  }
  ctx.restore();
  // selo (gira no eixo vertical enquanto desce)
  const spin = k < 1 ? Math.cos((1 - e) * Math.PI * 4) : 1;
  const w = S;
  const h = (S * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(Math.max(0.08, Math.abs(spin)), 1);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
  // estrelinhas
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + time * 0.8;
    const r = S * 0.62 + Math.sin(time * 2 + i) * 14;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.9;
    const s = (4 + 3 * Math.sin(time * 6 + i * 1.7)) * e;
    if (s <= 0) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i % 2 ? '#FFD23F' : '#FFFDF7';
    ctx.fillRect(-s, -s / 4, s * 2, s / 2);
    ctx.fillRect(-s / 4, -s, s / 2, s * 2);
    ctx.restore();
  }
}

// Fase 4: a camisa "Sou de Algodão" (o fio virou roupa!) chega enrolada, desenrola
// de cima para baixo e fica flamulando ao vento, como uma bandeira.
const SHIRT_W = 270;
const ROLL_START = 18; // quadros: o rolo aparece
const ROLL_END = 72; // quadros: terminou de desenrolar
let waveA = null;
let waveB = null;
function waveCanvas(c, w, h) {
  if (typeof document === 'undefined') return null;
  if (!c) c = document.createElement('canvas');
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}

function drawRoll(ctx, cx, y, w, r) {
  ctx.save();
  const g = ctx.createLinearGradient(0, y - r, 0, y + r);
  g.addColorStop(0, '#3A3A3A');
  g.addColorStop(0.35, '#1B1B1B');
  g.addColorStop(0.7, '#0E0E0E');
  g.addColorStop(1, '#2A2A2A');
  ctx.beginPath();
  rr(ctx, cx - w / 2, y - r, w, r * 2, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // brilho e a borda do tecido enrolado
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(cx - w / 2 + r, y - r * 0.55, w - r * 2, Math.max(1.5, r * 0.22));
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx - w / 2 + r * 0.9, y, r * 0.45, r * 0.75, 0, 0, Math.PI * 2);
  ctx.ellipse(cx + w / 2 - r * 0.9, y, r * 0.45, r * 0.75, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function sceneShirt(ctx, t, time) {
  const img = getSprite(ART.camisa);
  if (!img) { sceneHarvest(ctx, t, time); return; }
  // à direita do Dão, para não cobrir a dancinha dele
  const cx = VIEW_W * 0.68;
  const top = 196;
  const w = SHIRT_W;
  const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const k = Math.min(1, t / 20);
  const cy = top + h / 2;
  // o rolo cai do alto até os ombros
  const drop = Math.min(1, t / ROLL_START);
  const rollTopY = -40 + (top + 40) * (1 - Math.pow(1 - drop, 3));
  // desenrolar (0 → 1) com leve desaceleração
  const u0 = Math.min(1, Math.max(0, (t - ROLL_START) / (ROLL_END - ROLL_START)));
  const unroll = 1 - Math.pow(1 - u0, 2);
  const shown = Math.max(0, Math.round(h * unroll));

  // raios de luz e brilho atrás
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalAlpha = 0.5 * k * (0.3 + 0.7 * unroll);
  ctx.rotate(time * 0.6);
  ctx.fillStyle = '#FFE58A';
  for (let i = 0; i < 12; i++) {
    ctx.rotate((Math.PI * 2) / 12);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-26, -220);
    ctx.lineTo(26, -220);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 190);
  glow.addColorStop(0, `rgba(255, 253, 230, ${0.75 * k})`);
  glow.addColorStop(1, 'rgba(255, 253, 230, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 200, cy - 200, 400, 400);
  ctx.restore();

  // vento: cresce depois de desenrolar, com rajadas
  const wind = (0.35 + 0.65 * u0) * (0.8 + 0.2 * Math.sin(time * 0.9));
  const ampX = 16 * wind; // balanço lateral (cresce para baixo, como pano preso nos ombros)
  const ampY = 7 * wind; // ondas que correm pela camisa, como bandeira
  const pad = 24;
  const W = w + pad * 2;
  const H = h + pad * 2;
  waveA = waveCanvas(waveA, W, H);
  waveB = waveCanvas(waveB, W, H);
  if (shown > 0 && waveA && waveB) {
    const a = waveA.getContext('2d');
    const b = waveB.getContext('2d');
    a.clearRect(0, 0, W, H);
    b.clearRect(0, 0, W, H);
    a.imageSmoothingEnabled = false;
    b.imageSmoothingEnabled = false;
    const sxScale = img.naturalWidth / w;
    // 1) faixas horizontais deslocadas para os lados (onda descendo)
    const ROW = 3;
    for (let y = 0; y < shown; y += ROW) {
      const f = y / h;
      const dx = Math.sin(y * 0.045 - time * 5.2) * ampX * f;
      a.drawImage(img, 0, y * sxScale, img.naturalWidth, ROW * sxScale, pad + dx, pad + y, w, ROW + 0.5);
    }
    // 2) colunas deslocadas para cima/baixo (onda correndo de lado), com luz e sombra das dobras
    const COL = 3;
    for (let x = 0; x < W; x += COL) {
      const ph = x * 0.05 - time * 6.3;
      const dy = Math.sin(ph) * ampY * (0.4 + 0.6 * (Math.abs(x - W / 2) / (W / 2)));
      b.drawImage(waveA, x, 0, COL, H, x, dy, COL + 0.5, H);
    }
    b.globalCompositeOperation = 'source-atop';
    for (let x = 0; x < W; x += COL) {
      const shade = Math.cos(x * 0.05 - time * 6.3) * wind;
      b.fillStyle = shade > 0 ? `rgba(255,255,255,${0.1 * shade})` : `rgba(0,0,0,${-0.22 * shade})`;
      b.fillRect(x, 0, COL, H);
    }
    b.globalCompositeOperation = 'source-over';
    // a camisa inteira ainda dá um leve balanço preso pelos ombros
    const sway = Math.sin(time * 1.7) * 0.03 * wind;
    ctx.save();
    ctx.translate(cx, rollTopY);
    ctx.rotate(sway);
    ctx.drawImage(waveB, -W / 2, -pad);
    ctx.restore();
  }
  // o rolo ainda por desenrolar (fica mais fino conforme a camisa desce)
  if (unroll < 1) {
    const r = 6 + 14 * (1 - unroll);
    const edge = rollTopY + shown;
    drawRoll(ctx, cx, edge, w * 0.94 * (0.85 + 0.15 * unroll), r);
  }

  // estrelinhas cintilando em volta
  for (let i = 0; i < 10; i++) {
    const ang = (i / 10) * Math.PI * 2 + time * 0.8;
    const rad = 175 + Math.sin(time * 2 + i) * 18;
    const x = cx + Math.cos(ang) * rad * 1.15;
    const y = cy + Math.sin(ang) * rad * 0.75;
    const s = (4 + 3 * Math.sin(time * 6 + i * 1.7)) * k * unroll;
    if (s <= 0) continue;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = i % 2 ? '#FFD23F' : '#FFFDF7';
    ctx.fillRect(-s, -s / 4, s * 2, s / 2);
    ctx.fillRect(-s / 4, -s, s / 2, s * 2);
    ctx.restore();
  }
}

const TEXTS = {
  plantio: ['Colheita garantida!', 'O algodão segue para a algodoeira.'],
  algodoeira: ['Fardos prensados!', 'Agora a pluma vai para o laboratório.'],
  laboratorio: ['Qualidade aprovada!', 'O algodão brasileiro embarca para o mundo.'],
  manejo: ['Campo limpo!', 'Sem abrigo para o bicudo: algodão com o selo ABR.'],
  fiacao: ['Sou de Algodão!', 'O fio virou roupa: algodão do campo até você.'],
};

export function drawFinale(ctx, eng) {
  const f = eng.finale;
  if (!f) return;
  const t = f.t;
  const k = Math.min(1, t / 30);
  ctx.fillStyle = `rgba(255, 240, 190, ${0.18 * k})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const id = eng.level.id;
  if (id === 'laboratorio') sceneShip(ctx, t, eng.time, eng.level.groundTop * TILE);
  else if (id === 'algodoeira') sceneBales(ctx, t, eng.level.groundTop * TILE);
  else if (id === 'fiacao') sceneShirt(ctx, t, eng.time);
  else if (id === 'manejo') sceneSeal(ctx, t, eng.time);
  else sceneHarvest(ctx, t, eng.time);
  confetti(ctx, t);
  const [a, b] = TEXTS[id] ?? ['Fase concluída!', 'Muito bem, Dão!'];
  banner(ctx, a, b, k);
}
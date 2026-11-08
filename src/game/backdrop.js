import { VIEW_W, VIEW_H } from './config';
import { ART } from './sprites';
import { drawGinAnim } from './ginAnim';
import { drawLabAnim } from './labAnim';

const cache = new Map();

export function getBackdrop(url) {
  if (!url) return null;
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = url;
    cache.set(url, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

// Fundo fixo (sem parallax) para não causar tontura, com véu suave
// que reduz o contraste da ilustração e destaca o chão jogável.
// Posição da colhedora na arte da Fase 01 (em pixels da imagem original 2172x724).
const HARVESTER = { x: 735, y: 222, w: 632, h: 262, dustX: 760, dustY: 440 };

function drawHarvesterAnim(ctx, img, ox, oy, scale, time) {
  const k = img.naturalWidth / 2172;
  // motor trepidando: a máquina balança um pouco sobre as rodas
  // máquina parada na imagem (sem balanço), para a tela não tremer
  const bob = 0;
  const sway = 0;
  const machine = getBackdrop(ART.campoMaquina);
  if (machine) {
    // recorte da máquina com céu transparente, para as nuvens passarem por trás
    ctx.drawImage(
      machine,
      ox + 720 * k * scale + sway,
      oy + 205 * k * scale + bob,
      machine.naturalWidth * k * scale,
      machine.naturalHeight * k * scale
    );
  }

  // poeira saindo de trás da colhedora
  const dx = ox + HARVESTER.dustX * k * scale + sway;
  const dy = oy + HARVESTER.dustY * k * scale;
  for (let i = 0; i < 9; i++) {
    const life = (time * 0.7 + i / 9) % 1;
    const px = dx - life * 120 - (i % 3) * 8;
    const py = dy - life * 34 + Math.sin(i * 7 + time * 3) * 4;
    const r = 6 + life * 18;
    ctx.fillStyle = `rgba(214, 178, 128, ${0.42 * (1 - life)})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // fiapos de algodão voando
  for (let i = 0; i < 6; i++) {
    const life = (time * 0.45 + i / 6) % 1;
    const px = dx - 20 - life * 200;
    const py = dy - 60 - life * 60 + Math.sin(time * 4 + i) * 8;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * (1 - life)})`;
    ctx.beginPath();
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Trator amarelo com grade de disco, levantando poeira (Fase Bônus · Fitossanitário).
// Posição aproximada da grade/poeira na arte original (2652x887, metade da escala subida).
const TRATOR_DUST = { x: 1160, y: 480 };
const TRATOR_PIPE = { x: 582, y: 346 };
const TRATOR_FRONT_Y = 288;
function drawTratorAnim(ctx, img, ox, oy, scale, time) {
  const k = img.naturalWidth / 1774;
  const dx = ox + TRATOR_DUST.x * k * scale;
  const dy = oy + TRATOR_DUST.y * k * scale;
  // fumaça do escapamento: baforadas cinzas que sobem e ficam para trás do trator
  const ex = ox + TRATOR_PIPE.x * k * scale;
  const ey = oy + TRATOR_PIPE.y * k * scale;
  for (let i = 0; i < 12; i++) {
    const life = (time * 0.45 + i / 12) % 1;
    const px = ex + life * 90 + Math.sin(time * 2 + i * 1.7) * 6 * life;
    const py = ey - 4 - life * 110;
    const r = 7 + life * 26;
    const g = Math.round(55 + life * 110);
    ctx.fillStyle = `rgba(${g}, ${g}, ${g + 6}, ${0.8 * (1 - life) * Math.min(1, life * 10)})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // poeira saindo da grade de disco, subindo e se espalhando para a direita
  for (let i = 0; i < 14; i++) {
    const life = (time * 0.55 + i / 14) % 1;
    const spread = i % 5;
    const px = dx + life * 230 + spread * 10;
    const py = dy - life * 46 + Math.sin(i * 5 + time * 2.4) * 10 - spread * 6;
    const r = 10 + life * 30;
    ctx.fillStyle = `rgba(206, 168, 104, ${0.4 * (1 - life)})`;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // restos de palha voando (pedacinhos escuros, como na arte original)
  for (let i = 0; i < 7; i++) {
    const life = (time * 0.8 + i / 7) % 1;
    const px = dx + 40 + life * 300;
    const py = dy - 50 - life * 90 + Math.sin(time * 6 + i * 3) * 10;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 8 + i * 2);
    ctx.fillStyle = `rgba(122, 86, 44, ${0.75 * (1 - life)})`;
    ctx.fillRect(-4, -1.4, 8, 2.8);
    ctx.restore();
  }
}

// pan (0 → 1): avanço do Dão na fase. O fundo é um pouco maior que a tela e desliza devagar
// para o lado (parallax), dando a sensação de caminhar pelo cenário.
const PARALLAX_ZOOM = 1.1;

export function drawBackdrop(ctx, img, tint = null, fit = null, anim = null, time = 0, pan = 0.5) {
  if (fit?.mode === 'width') {
    // fundos panorâmicos (ex.: pátio de fardos): ocupa a largura e estica o céu para cima
    const scale = VIEW_W / img.naturalWidth;
    const h = img.naturalHeight * scale;
    const top = fit.bottom - h;
    if (top > 0) ctx.drawImage(img, 0, 0, img.naturalWidth, 2, 0, 0, VIEW_W, top + 1);
    ctx.drawImage(img, 0, top, VIEW_W, h);
  } else {
    const cover = Math.max(VIEW_W / img.naturalWidth, VIEW_H / img.naturalHeight);
    // fundos panorâmicos já sobram para os lados; os outros ganham um leve zoom para poder deslizar
    const scale = cover * Math.max(1, PARALLAX_ZOOM / ((img.naturalWidth * cover) / VIEW_W));
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x0 = -(w - VIEW_W) * Math.min(1, Math.max(0, pan));
    ctx.drawImage(img, x0, VIEW_H - h, w, h);
    if (anim === 'harvester') {
      // nuvens à deriva, atrás da colhedora (a faixa do céu repete na emenda)
      const clouds = getBackdrop(ART.campoNuvens);
      if (clouds) {
        const cw = w;
        const ch = clouds.naturalHeight * scale;
        const off = (time * 16) % cw;
        const cx0 = x0 + off;
        ctx.drawImage(clouds, cx0, VIEW_H - h, cw, ch);
        ctx.drawImage(clouds, cx0 - cw, VIEW_H - h, cw, ch);
      }
    }
    if (anim === 'lab') drawLabAnim(ctx, img, x0, VIEW_H - h, w, h, time);
    if (anim === 'gin') drawGinAnim(ctx, x0, VIEW_H - h, w, h, time);
    if (anim === 'harvester') drawHarvesterAnim(ctx, img, x0, VIEW_H - h, scale, time);
    if (anim === 'trator') {
      // igual à Fase 1: o céu limpo fica parado e a camada de nuvens desliza por cima;
      // depois o recorte do horizonte (trator, árvores) volta por cima das nuvens
      const k = img.naturalWidth / 1774;
      const clouds = getBackdrop(ART.manejoNuvens);
      if (clouds) {
        const ch = clouds.naturalHeight * k * scale;
        const off = (time * 16) % w;
        ctx.drawImage(clouds, x0 + off, VIEW_H - h, w, ch);
        ctx.drawImage(clouds, x0 + off - w, VIEW_H - h, w, ch);
      }
      const front = getBackdrop(ART.manejoFrente);
      if (front) ctx.drawImage(front, x0, VIEW_H - h + TRATOR_FRONT_Y * k * scale, w, front.naturalHeight * k * scale);
      drawTratorAnim(ctx, img, x0, VIEW_H - h, scale, time);
    }
  }

  const veil = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  veil.addColorStop(0, 'rgba(255, 253, 246, 0.14)');
  veil.addColorStop(1, 'rgba(255, 253, 246, 0.06)');
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // fundos muito cheios (ex.: lavoura com capulhos) ganham um véu escuro
  // para os capulhos de pontos e os inimigos se destacarem
  if (tint) {
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
}
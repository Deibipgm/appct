import { VIEW_W } from './config';
import { INK, rr } from './brush';
import { drawTallFardinho } from './fardinho';

const ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
const BALE_TILE = 26;

// Fase 2: a prensa da algodoeira bate, o fardo sai pela esteira e vai para a pilha.
const PRESS_X = 40;
const BELT_X1 = 150;
const BELT_X2 = VIEW_W - 250;
const STACK = [[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]];
const BALE_EVERY = 55;
const BELT_SPEED = 4.2;

function steel(ctx, x, y, w, h, r = 3) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, '#6F7B85');
  g.addColorStop(0.35, '#DDE4E9');
  g.addColorStop(1, '#8D99A3');
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function rivets(ctx, pts) {
  pts.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = '#E9F0F4';
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
}

// Prensa hidráulica: duas colunas, cilindro no topo, pistão que desce sobre o algodão,
// manômetro, faixa de segurança e plaquinha PRENSA.
function drawPress(ctx, groundY, t) {
  const X = PRESS_X;
  const W = 120;
  const top = groundY - 176;
  const k = (t % BALE_EVERY) / BALE_EVERY;
  const push = k < 0.35 ? ease(k / 0.35) : 1 - ease((k - 0.35) / 0.65);

  // sombra no chão
  ctx.fillStyle = 'rgba(27, 18, 12, 0.22)';
  ctx.beginPath();
  ctx.ellipse(X + W / 2, groundY - 2, W * 0.62, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // base verde com faixa de segurança
  rr(ctx, X - 4, groundY - 52, W + 8, 52, 8);
  const gb = ctx.createLinearGradient(0, groundY - 52, 0, groundY);
  gb.addColorStop(0, '#58C04A');
  gb.addColorStop(1, '#2F8A34');
  ctx.fillStyle = gb;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.save();
  rr(ctx, X + 2, groundY - 14, W - 4, 10, 3);
  ctx.clip();
  for (let x = X - 10; x < X + W; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, groundY - 4);
    ctx.lineTo(x + 8, groundY - 4);
    ctx.lineTo(x + 16, groundY - 14);
    ctx.lineTo(x + 8, groundY - 14);
    ctx.closePath();
    ctx.fillStyle = Math.round((x - X) / 16) % 2 ? '#1B120C' : '#FFD23F';
    ctx.fill();
  }
  ctx.restore();
  rivets(ctx, [[X + 6, groundY - 46], [X + W - 6, groundY - 46]]);

  // plaquinha PRENSA
  rr(ctx, X + 16, groundY - 44, W - 32, 22, 6);
  ctx.fillStyle = '#FFF4D2';
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.font = '900 14px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7A3E10';
  ctx.fillText('PRENSA', X + W / 2, groundY - 28);
  ctx.textAlign = 'left';

  // câmara com algodão sendo comprimido (aparece entre as colunas)
  const chamberTop = groundY - 110;
  const plateY = top + 58 + push * 38;
  rr(ctx, X + 16, chamberTop, W - 32, 58, 4);
  ctx.fillStyle = '#4B3A2C';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // algodão ocupa o espaço entre o pistão e o fundo da câmara
  ctx.save();
  rr(ctx, X + 19, chamberTop + 3, W - 38, 52, 3);
  ctx.clip();
  const fluffTop = Math.max(chamberTop + 3, plateY + 12);
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      const cx = X + 28 + i * 13 + (j % 2) * 6;
      const cy = chamberTop + 50 - j * 9;
      if (cy - 9 < fluffTop - 4) continue;
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFDF7';
      ctx.fill();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(80, 60, 40, 0.55)';
      ctx.stroke();
    }
  }
  ctx.restore();

  // colunas de aço
  steel(ctx, X + 2, top + 22, 14, groundY - top - 70, 3);
  steel(ctx, X + W - 16, top + 22, 14, groundY - top - 70, 3);
  rivets(ctx, [[X + 9, top + 32], [X + W - 9, top + 32], [X + 9, groundY - 66], [X + W - 9, groundY - 66]]);

  // cabeçote verde com o cilindro
  rr(ctx, X - 2, top + 6, W + 4, 26, 8);
  const gh = ctx.createLinearGradient(0, top + 6, 0, top + 32);
  gh.addColorStop(0, '#6ED05A');
  gh.addColorStop(1, '#36903A');
  ctx.fillStyle = gh;
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  steel(ctx, X + W / 2 - 15, top - 8, 30, 20, 5);
  // haste do pistão e placa de prensagem
  steel(ctx, X + W / 2 - 7, top + 30, 14, plateY - top - 28, 2);
  rr(ctx, X + 20, plateY, W - 40, 14, 4);
  const gp = ctx.createLinearGradient(0, plateY, 0, plateY + 14);
  gp.addColorStop(0, '#FFE16B');
  gp.addColorStop(1, '#E7A817');
  ctx.fillStyle = gp;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();

  // manômetro: o ponteiro sobe quando o pistão desce
  const gx = X + W + 6;
  const gy = top + 30;
  ctx.beginPath();
  ctx.arc(gx, gy, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(gx, gy, 8, Math.PI * 1.05, Math.PI * 1.95);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#3F9A3C';
  ctx.stroke();
  const ang = Math.PI * (1.1 + 0.8 * push);
  ctx.beginPath();
  ctx.moveTo(gx, gy);
  ctx.lineTo(gx + Math.cos(ang) * 9, gy + Math.sin(ang) * 9);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#D7262E';
  ctx.stroke();

  // vapor sai no momento da prensagem
  if (push > 0.8) {
    for (let i = 0; i < 3; i++) {
      const r = 5 + i * 2 + ((t * 0.4) % 4);
      ctx.beginPath();
      ctx.arc(X - 6 - i * 6, top + 14 - i * 8, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.75 - i * 0.2})`;
      ctx.fill();
    }
  }
}

function drawBelt(ctx, groundY, t) {
  const y = groundY - 26;
  ctx.beginPath();
  rr(ctx, BELT_X1, y, BELT_X2 - BELT_X1, 16, 8);
  ctx.fillStyle = '#4A3A2A';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = '#C9AE7E';
  const off = (t * BELT_SPEED) % 24;
  for (let x = BELT_X1 + 8 + off; x < BELT_X2 - 8; x += 24) ctx.fillRect(x, y + 6, 10, 4);
  [BELT_X1 + 8, BELT_X2 - 8].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, y + 8, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#9AA3AA';
    ctx.fill();
    ctx.stroke();
  });
}

export function sceneBales(ctx, t, groundY) {
  drawBelt(ctx, groundY, t);
  const beltTop = groundY - 26;
  const stackX = BELT_X2 + 40;
  const travel = (BELT_X2 - BELT_X1) / BELT_SPEED;
  for (let i = 0; i < STACK.length; i++) {
    const age = t - 20 - i * BALE_EVERY;
    if (age < 0) break;
    let x;
    let y;
    if (age < travel) {
      x = BELT_X1 + age * BELT_SPEED - BALE_TILE / 2;
      y = beltTop - BALE_TILE * 2;
    } else {
      // pulo da ponta da esteira até o lugar na pilha
      const k = ease((age - travel) / 24);
      const [sx, sy] = STACK[i];
      const tx = stackX + sx * 40;
      const ty = groundY - BALE_TILE * 2 - sy * (BALE_TILE * 2);
      const fx = BELT_X2 - BALE_TILE / 2;
      const fy = beltTop - BALE_TILE * 2;
      x = fx + (tx - fx) * k;
      y = fy + (ty - fy) * k - Math.sin(k * Math.PI) * 50;
    }
    drawTallFardinho(ctx, x, y, BALE_TILE);
  }
  drawPress(ctx, groundY, t);
}

// Fase 3: o navio atraca, o guindaste embarca os fardos aprovados e o navio parte.
const ARRIVE = 110;
const LOAD_EACH = 34;
const LOADS = 5;
const DEPART = ARRIVE + LOADS * LOAD_EACH + 20;
const DOCK_X = 110;

function shipX(t) {
  const docked = VIEW_W * 0.5;
  if (t < ARRIVE) return VIEW_W + 220 - ease(t / ARRIVE) * (VIEW_W + 220 - docked);
  if (t < DEPART) return docked;
  const d = t - DEPART;
  return docked + d * d * 0.05;
}

function drawSea(ctx, sea, groundY, time) {
  ctx.fillStyle = 'rgba(30,120,190,0.9)';
  ctx.fillRect(0, sea, VIEW_W, groundY - sea);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const wx = ((i * 110 + time * 40) % (VIEW_W + 60)) - 30;
    ctx.beginPath();
    ctx.arc(wx, sea + 18 + (i % 3) * 30, 12, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  // cais
  ctx.beginPath();
  rr(ctx, 0, sea - 10, DOCK_X + 70, 26, 4);
  ctx.fillStyle = '#9A6B3F';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
}

function drawShip(ctx, sx, hy, loaded, time) {
  ctx.beginPath();
  ctx.moveTo(sx - 150, hy);
  ctx.lineTo(sx + 170, hy);
  ctx.lineTo(sx + 130, hy + 50);
  ctx.lineTo(sx - 120, hy + 50);
  ctx.closePath();
  ctx.fillStyle = '#E81E25';
  ctx.fill();
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = '#FFFDF7';
  ctx.fillRect(sx + 80, hy - 50, 50, 50);
  ctx.strokeRect(sx + 80, hy - 50, 50, 50);
  ctx.fillStyle = '#FFD23F';
  ctx.fillRect(sx + 96, hy - 80, 18, 30);
  ctx.strokeRect(sx + 96, hy - 80, 18, 30);
  for (let i = 0; i < 4; i++) {
    const k = (time * 0.8 + i * 0.25) % 1;
    ctx.fillStyle = `rgba(230,230,230,${0.8 - k * 0.7})`;
    ctx.beginPath();
    ctx.arc(sx + 105 - k * 40, hy - 90 - k * 60, 8 + k * 14, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < loaded; i++) drawTallFardinho(ctx, sx - 140 + i * 42, hy - BALE_TILE * 2, BALE_TILE);
  ctx.font = '900 14px "Baloo 2", system-ui, sans-serif';
  ctx.fillStyle = '#FFFDF7';
  ctx.textAlign = 'center';
  ctx.fillText('ALGODÃO DO BRASIL', sx, hy + 32);
  ctx.textAlign = 'left';
}

export function sceneShip(ctx, t, time, groundY) {
  const sea = groundY - 150;
  drawSea(ctx, sea, groundY, time);
  const sx = shipX(t);
  const hy = sea + 40 + Math.sin(time * 3) * 3;
  const loading = t - ARRIVE;
  const loaded = Math.max(0, Math.min(LOADS, Math.floor(loading / LOAD_EACH)));
  // fardos esperando no cais
  for (let i = loaded + (loading >= 0 && loaded < LOADS ? 1 : 0); i < LOADS; i++) {
    drawTallFardinho(ctx, 6 + (i % 3) * 34, sea - 10 - BALE_TILE * 2 - Math.floor(i / 3) * BALE_TILE * 2, BALE_TILE);
  }
  drawShip(ctx, sx, hy, loaded, time);

  // guindaste levando o fardo da vez em arco até o navio
  const craneX = DOCK_X + 30;
  const craneTop = sea - 190;
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(craneX, sea - 10);
  ctx.lineTo(craneX, craneTop);
  ctx.stroke();
  if (loading >= 0 && loaded < LOADS) {
    const k = ease((loading % LOAD_EACH) / LOAD_EACH);
    const fromX = 6 + (loaded % 3) * 34 + BALE_TILE / 2;
    const toX = sx - 140 + loaded * 42 + BALE_TILE / 2;
    const bx = fromX + (toX - fromX) * k;
    const by = sea - 10 - BALE_TILE * 2 - Math.sin(k * Math.PI) * 90 + (hy - sea + 10) * k;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(craneX, craneTop);
    ctx.lineTo(bx, craneTop + 10);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, craneTop + 10);
    ctx.lineTo(bx, by);
    ctx.stroke();
    drawTallFardinho(ctx, bx - BALE_TILE / 2, by, BALE_TILE);
  }
}
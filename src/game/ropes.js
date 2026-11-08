import { TILE, VIEW_W } from './config';
import { INK } from './brush';
import { emitCotton } from './fx';
import { ART, getSprite } from './sprites';

// Cordas de balanço da Fiação Mágica: o Dão se agarra no ar, balança como pêndulo e solta com pulo.
const G = 0.55; // "gravidade" do pêndulo
const MAX_ANG = 1.2;
const COLORS = ['#E8506A', '#FFC93A', '#3FB5C9', '#7FD05A'];

export function initRopes(eng) {
  eng.ropes = (eng.level.ropes ?? []).map((r, i) => ({
    ax: r.x * TILE + TILE / 2,
    ay: r.top ?? 0,
    len: r.len ?? 280,
    ang: 0,
    vang: 0,
    color: COLORS[i % COLORS.length],
    held: false,
  }));
}

const bobOf = (r) => ({ x: r.ax + Math.sin(r.ang) * r.len, y: r.ay + Math.cos(r.ang) * r.len });

// Chamado no começo do updatePlayer: devolve true enquanto o Dão está pendurado.
export function ropeHang(eng) {
  const p = eng.player;
  const r = p.rope;
  if (!r) return false;
  const dir = (eng.input.right ? 1 : 0) - (eng.input.left ? 1 : 0);
  // balançar: empurrar a favor do movimento aumenta o arco
  r.vang += -(G / r.len) * Math.sin(r.ang) + dir * 0.0011;
  r.vang *= 0.9992;
  r.ang += r.vang;
  if (Math.abs(r.ang) > MAX_ANG) {
    r.ang = Math.sign(r.ang) * MAX_ANG;
    r.vang *= -0.4;
  }
  const b = bobOf(r);
  p.x = b.x - p.w / 2;
  p.y = b.y - 6;
  p.vx = 0;
  p.vy = 0;
  p.onGround = false;
  if (Math.abs(r.vang) > 0.002) p.face = Math.sign(r.vang);

  const tap = eng.input.jumpTap;
  eng.input.jumpTap = false;
  if (tap || (eng.input.jump && !eng.prevJump)) {
    // solta com a velocidade do arco + um impulso para cima
    p.vx = r.len * r.vang * Math.cos(r.ang) * 1.1;
    p.vy = -r.len * r.vang * Math.sin(r.ang) - 8.5;
    p.vx = Math.max(-9, Math.min(9, p.vx));
    p.rope = null;
    p.ropeCd = 24;
    r.held = false;
    eng.hooks.onSound?.('jump');
    emitCotton(eng, b.x, b.y, 4);
  }
  eng.prevJump = eng.input.jump;
  return true;
}

// Chamado depois do movimento: agarra a corda se o Dão encostar no ar.
export function updateRopes(eng) {
  const p = eng.player;
  p.ropeCd = Math.max(0, (p.ropeCd ?? 0) - 1);
  for (const r of eng.ropes) {
    if (!r.held) {
      // corda solta volta ao centro balançando
      r.vang += -(G / r.len) * Math.sin(r.ang);
      r.vang *= 0.994;
      r.ang += r.vang;
    }
    if (p.rope || p.onGround || p.ropeCd > 0) continue;
    const hx = p.x + p.w / 2;
    const hy = p.y + p.h * 0.3;
    // distância do Dão ao segmento da corda
    const b = bobOf(r);
    const dx = b.x - r.ax;
    const dy = b.y - r.ay;
    const t = Math.max(0.12, Math.min(1, ((hx - r.ax) * dx + (hy - r.ay) * dy) / (dx * dx + dy * dy)));
    const px = r.ax + dx * t;
    const py = r.ay + dy * t;
    if (Math.hypot(hx - px, hy - py) < 48 && t > 0.3) {
      p.rope = r;
      r.held = true;
      const rx = hx - r.ax;
      const ry = Math.max(40, hy - r.ay);
      r.ang = Math.max(-MAX_ANG, Math.min(MAX_ANG, Math.atan2(rx, ry)));
      r.vang = (p.vx * 0.9) / r.len;
      eng.hooks.onSound?.('boll');
      emitCotton(eng, hx, hy, 5);
    }
  }
}

export function drawRopes(ctx, eng) {
  const cam = eng.camera;
  (eng.ropes ?? []).forEach((r) => {
    const ax = r.ax - cam;
    if (ax < -300 || ax > VIEW_W + 300) return;
    const b = bobOf(r);
    const bx = b.x - cam;
    // brilho pulsando quando o Dão está perto: "dá para agarrar"
    const p = eng.player;
    if (!r.held && !p.rope && Math.hypot(p.x + p.w / 2 - b.x, p.y - b.y) < 300) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(255, 244, 170, ${0.18 + 0.16 * Math.sin(eng.time * 7)})`;
      ctx.lineWidth = 40;
      ctx.beginPath();
      ctx.moveTo(ax, r.ay);
      ctx.lineTo(bx, b.y);
      ctx.stroke();
      ctx.restore();
    }
    if (drawRopeArt(ctx, ax, r.ay, bx, b.y, 26)) return;
    // fio trançado: duas cores se alternando ao longo da corda
    const segs = 16;
    for (let pass = 0; pass < 2; pass++) {
      ctx.lineCap = 'round';
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs;
        const t1 = (i + 1) / segs;
        const x0 = ax + (bx - ax) * t0;
        const y0 = r.ay + (b.y - r.ay) * t0;
        const x1 = ax + (bx - ax) * t1;
        const y1 = r.ay + (b.y - r.ay) * t1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        if (pass === 0) {
          ctx.strokeStyle = INK;
          ctx.lineWidth = 9;
        } else {
          ctx.strokeStyle = i % 2 ? r.color : '#FFF3D6';
          ctx.lineWidth = 5;
        }
        ctx.stroke();
      }
    }
    // argola no teto e pompom na ponta
    ctx.beginPath();
    ctx.arc(ax, r.ay, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#E0A82E';
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bx, b.y + 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.stroke();
  });
}

// Corda colorida com botões (arte do jogo) esticada entre dois pontos.
// A arte tem uma barriga natural; aqui ela é "desentortada" em tiras para ficar reta, com a espessura pedida.
const ART_W = 1100;
const ART_C0 = 42; // centro da corda nas pontas (px da arte)
const ART_SAG = 95; // quanto o centro desce no meio
export function drawRopeArt(ctx, ax, ay, bx, by, thick = 20, sag = 0) {
  const img = getSprite(ART.corda);
  if (!img) return false;
  const L = Math.hypot(bx - ax, by - ay);
  if (L < 4) return true;
  const k = thick / 50;
  const sx = L / ART_W;
  const n = Math.max(8, Math.round(L / 6));
  const sw = img.naturalWidth / n;
  const f = img.naturalWidth / ART_W;
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(Math.atan2(by - ay, bx - ax));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const c = ART_C0 + ART_SAG * Math.sin(Math.PI * t);
    ctx.drawImage(img, i * sw, 0, sw + 0.6, img.naturalHeight, (i * ART_W * sx) / n, -c * k + Math.sin(Math.PI * t) * sag, (ART_W * sx) / n + 0.8, (img.naturalHeight / f) * k);
  }
  ctx.restore();
  return true;
}

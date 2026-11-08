import { TILE } from './config';
import { INK } from './brush';

// Cochonilha: para, enche a boca de ácido e cospe uma gota em arco na direção do Dão.
const COOLDOWN = 140;
const CHARGE = 26;

// Retorna true enquanto está preparando o cuspe (fica parada).
export function updateCochonilha(eng, e) {
  const p = eng.player;
  const dx = p.x + p.w / 2 - (e.x + e.w / 2);
  e.spitCd = Math.max(0, (e.spitCd ?? 60) - 1);
  if (e.charge > 0) {
    e.charge--;
    e.vx = Math.sign(dx || e.vx || 1) * 0.01;
    e.alert = true;
    if (e.charge === 0) spit(eng, e, Math.sign(dx || 1));
    return true;
  }
  if (e.spitCd === 0 && Math.abs(dx) < 330 && Math.abs(p.y - e.y) < 160) {
    e.charge = CHARGE;
    return true;
  }
  return false;
}

function spit(eng, e, dir) {
  e.spitCd = COOLDOWN;
  eng.acid = eng.acid ?? [];
  eng.acid.push({ x: e.x + e.w / 2 + dir * 26, y: e.y + 4, vx: dir * 4.4, vy: -6.5, t: 0 });
  eng.hooks.onSound?.('spit');
}

export function updateAcid(eng) {
  const p = eng.player;
  const ground = eng.level.groundTop * TILE;
  eng.acid = (eng.acid ?? []).filter((a) => {
    a.t++;
    if (a.splash) return a.t < 22;
    a.vy += 0.32;
    a.x += a.vx;
    a.y += a.vy;
    if (Math.abs(p.x + p.w / 2 - a.x) < 20 && Math.abs(p.y + p.h / 2 - a.y) < 26) {
      eng.hurt();
      a.splash = true;
      a.t = 0;
      return true;
    }
    if (a.y >= ground - 4) {
      a.y = ground - 4;
      a.splash = true;
      a.t = 0;
    }
    return a.t < 200;
  });
}

export function drawAcid(ctx, eng) {
  const cam = eng.camera;
  // boca cheia de ácido enquanto prepara o cuspe
  eng.enemies.forEach((e) => {
    if (!(e.charge > 0) || e.dead) return;
    const dir = e.vx >= 0 ? 1 : -1;
    const k = 1 - e.charge / CHARGE;
    ctx.beginPath();
    ctx.arc(e.x + e.w / 2 + dir * 24 - cam, e.y + 8, 3 + k * 7, 0, Math.PI * 2);
    ctx.fillStyle = '#9BEA2E';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
  (eng.acid ?? []).forEach((a) => {
    const x = a.x - cam;
    if (a.splash) {
      const k = a.t / 22;
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = '#7ED321';
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(x + i * 7 * (1 + k * 2), a.y - Math.abs(Math.sin(i + 1)) * 14 * k, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.ellipse(x, a.y + 2, 10 + k * 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }
    ctx.save();
    ctx.translate(x, a.y);
    ctx.rotate(Math.atan2(a.vy, a.vx) + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.quadraticCurveTo(8, 2, 0, 8);
    ctx.quadraticCurveTo(-8, 2, 0, -12);
    ctx.fillStyle = '#9BEA2E';
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(-2, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
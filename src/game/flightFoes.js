import { VIEW_W, TILE } from './config';
import { GROUND_Y as SKY_FLOOR_Y } from './flightGround';

// Inimigos da fase aérea e o chefão Barão Bicudo.
//  mosca: mosca-branca, sobe e desce em onda
//  traca: mariposa (traça), persegue a altura do avião
//  bicudo: voa batendo as asinhas e cospe gosma mirando no avião
//  percevejo: blindado, aguenta vários jatos e investe em linha reta
//  tempestade: nuvem que não morre; solta raio até a lavoura (desvie)
export const KINDS = {
  mosca: { hp: 1, w: 40, h: 32, vx: -3.2, score: 50 },
  traca: { hp: 2, w: 54, h: 38, vx: -4, score: 80 },
  bicudo: { hp: 3, w: 56, h: 50, vx: -1.8, score: 120 },
  percevejo: { hp: 4, w: 64, h: 40, vx: -2.4, score: 150 },
  tempestade: { hp: Infinity, w: 150, h: 96, vx: -2.6, score: 0 },
};

export const hitBox = (pt, r, pad = 0) =>
  pt.x > r.x - pad && pt.x < r.x + r.w + pad && pt.y > r.y - pad && pt.y < r.y + r.h + pad;
const overlap = (a, b, inset = 8) =>
  a.x + inset < b.x + b.w && a.x + a.w - inset > b.x && a.y + inset < b.y + b.h && a.y + a.h - inset > b.y;

function makeFoe(kind, y, delay) {
  const k = KINDS[kind];
  return { kind, x: VIEW_W + 60, y, baseY: y, t: -delay, hp: k.hp, w: k.w, h: k.h, vx: k.vx, flash: 0, cd: 60 };
}

export const BOSS_HP = 60;

export function spawnWaves(eng) {
  const fl = eng.fl;
  for (const w of fl.waves) {
    if (w.done || fl.dist < w.at * TILE) continue;
    w.done = true;
    for (let i = 0; i < (w.n ?? 1); i++) {
      const y = w.y * TILE + (w.spread ? (i % 2 ? w.spread : -w.spread) : 0);
      fl.foes.push(makeFoe(w.kind, y, i * (w.gap ?? 26)));
    }
  }
  if (!fl.boss && fl.dist >= fl.length) {
    fl.boss = { x: VIEW_W + 220, y: 150, w: 210, h: 160, hp: BOSS_HP, max: BOSS_HP, t: 0, flash: 0, atk: 0, dead: false };
    eng.hooks.onSound?.('gate');
  }
}

function aimAt(from, pl, speed) {
  const dx = pl.x + pl.w / 2 - from.x;
  const dy = pl.y + pl.h / 2 - from.y;
  const d = Math.hypot(dx, dy) || 1;
  return { x: from.x, y: from.y, vx: (dx / d) * speed, vy: (dy / d) * speed };
}

function damage(eng, f, cx, cy) {
  f.hp--;
  f.flash = 6;
  eng.fl.booms.push({ x: cx, y: cy, t: 18, s: 0.35 });
  if (f.hp > 0) return;
  f.dead = true;
  eng.score += KINDS[f.kind].score;
  eng.fl.booms.push({ x: f.x + f.w / 2, y: f.y + f.h / 2, t: 0, s: 0.8 });
  eng.hooks.onSound?.('stomp');
}

export function updateFoes(eng, hurt) {
  const fl = eng.fl;
  const pl = fl.plane;
  for (const f of fl.foes) {
    f.t++;
    if (f.t < 0) continue;
    if (f.flash > 0) f.flash--;
    f.x += f.vx;
    if (f.kind === 'mosca') f.y = f.baseY + Math.sin(f.t * 0.07) * 50;
    if (f.kind === 'traca' && f.x < VIEW_W * 0.75) f.y += Math.sign(pl.y - f.y) * 1.3;
    if (f.kind === 'percevejo') {
      // passa devagar e, quando se alinha com o avião, investe
      if (!f.dash && f.x < VIEW_W * 0.7 && Math.abs(pl.y - f.y) < 60) {
        f.dash = true;
        f.vx = -6.5;
      }
      if (!f.dash) f.y = f.baseY + Math.sin(f.t * 0.05) * 18;
    }
    if (f.kind === 'bicudo') {
      f.y = f.baseY + Math.sin(f.t * 0.04) * 24;
      if (--f.cd <= 0 && f.x < VIEW_W - 40 && f.x > pl.x + 60) {
        f.cd = 120;
        fl.foeShots.push({ ...aimAt({ x: f.x, y: f.y + f.h / 2 }, pl, 3.4), c: '#7A9A2E' });
      }
    }
    if (f.kind === 'tempestade') {
      // raio: aviso piscando e depois descarga até a lavoura
      f.bolt = (f.t % 150) - 90;
      if (f.bolt === 31) eng.hooks.onSound?.('block');
      if (f.bolt > 30 && f.bolt < 60) {
        const bx = f.x + f.w / 2;
        if (pl.x + pl.w - 20 > bx - 16 && pl.x + 20 < bx + 16 && pl.y + pl.h > f.y + f.h && pl.y < SKY_FLOOR_Y) hurt(eng, 'raio');
      }
    }
    if (f.kind !== 'tempestade') {
      for (const s of fl.shots) {
        if (!s.hit && hitBox(s, f, 6)) {
          s.hit = true;
          damage(eng, f, s.x, s.y);
          if (f.dead) break;
        }
      }
    } else
      fl.shots.forEach((s) => {
        if (!s.hit && hitBox(s, f, -10)) s.hit = true;
      });
    if (!f.dead && overlap(pl, f, 10)) {
      hurt(eng, f.kind);
      if (f.kind !== 'tempestade') damage(eng, f, f.x, f.y + f.h / 2);
    }
  }
  fl.foes = fl.foes.filter((f) => !f.dead && f.x > -200);
}

const ATTACKS = ['spread', 'aim', 'minions', 'aim'];

export function updateBoss(eng, hurt) {
  const fl = eng.fl;
  const b = fl.boss;
  if (!b) return;
  b.t++;
  if (b.flash > 0) b.flash--;
  if (b.dead) {
    b.y += 2.4;
    b.rot = (b.rot ?? 0) - 0.01;
    if (b.t % 6 === 0) fl.booms.push({ x: b.x + Math.random() * b.w, y: b.y + Math.random() * b.h, t: 0, s: 0.7 });
    return;
  }
  const pl = fl.plane;
  b.x += (VIEW_W - 270 - b.x) * 0.02;
  b.y = 170 + Math.sin(b.t * 0.018) * 95 - b.h / 2 + 40;
  // fica mais bravo com metade da vida: ataca mais rápido
  const every = b.hp > b.max / 2 ? 110 : 80;
  if (b.t > 120 && b.t % every === 0) {
    const mouth = { x: b.x + 20, y: b.y + b.h * 0.62 };
    const atk = ATTACKS[b.atk++ % ATTACKS.length];
    if (atk === 'spread') {
      for (let i = -3; i <= 3; i++) fl.foeShots.push({ x: mouth.x, y: mouth.y, vx: -4.2 * Math.cos(i * 0.22), vy: 4.2 * Math.sin(i * 0.22), c: '#9B5BD4' });
    } else if (atk === 'aim') {
      [0, 10, 20].forEach((d) => fl.foeShots.push({ ...aimAt(mouth, pl, 5), x: mouth.x + d, c: '#7A9A2E' }));
    } else {
      [-60, 0, 60].forEach((dy, i) => fl.foes.push({ ...makeFoe('mosca', b.y + b.h / 2 + dy, i * 14), x: b.x }));
    }
    eng.hooks.onSound?.('spit');
  }
  for (const s of fl.shots) {
    if (!s.hit && hitBox(s, b, -14)) {
      s.hit = true;
      b.hp--;
      b.flash = 5;
      fl.booms.push({ x: s.x, y: s.y, t: 18, s: 0.35 });
      if (b.hp <= 0) {
        b.dead = true;
        b.t = 0;
        eng.score += 1000;
        eng.shake = 20;
        eng.hooks.onSound?.('stomp');
        fl.foes.forEach((f) => {
          f.dead = true;
        });
        fl.foeShots = [];
        break;
      }
    }
  }
  if (!b.dead && overlap(pl, b, 26)) hurt(eng, 'barao');
}

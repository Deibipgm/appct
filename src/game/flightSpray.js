import { VIEW_W, TILE } from './config';
import { INK, star, ink, puffCluster } from './brush';
import { ART, getSprite, drawSprite } from './sprites';
import { GROUND_Y } from './flightGround';

// Bicudos escondidos dentro da lavoura. Antes de cada ninho vem um capulho dourado de pulverização:
// pegando ele, o avião solta a calda por baixo e acaba com os bicudos ao passar por cima deles.
const SPRAY_FRAMES = 480;
const GAP = 95;
const SETTLE_Y = GROUND_Y - 52; // altura das copas, onde os bicudos aparecem
const SETTLE_FRAMES = 50;
const HIT_R = 36;

export function initSpray(def) {
  const nests = def.nests ?? [];
  return {
    spray: 0,
    mist: [],
    pickups: nests.map((n) => ({ at: (n.at - 8) * TILE, y: (n.y ?? 7) * TILE + 24, x: 0, live: false, taken: false })),
    bugs: nests.flatMap((n) =>
      Array.from({ length: n.n ?? 3 }, (_, i) => ({ at: n.at * TILE + i * GAP, x: 0, live: false, gone: false, dead: false, deadT: 0, seed: i * 1.9 + n.at })),
    ),
  };
}

export function updateSpray(eng) {
  const fl = eng.fl;
  const sp = fl.sp;
  const pl = fl.plane;
  // a calda sai pelas barras sob as asas, cai em leque e assenta sobre a lavoura como uma nuvem
  if (sp.spray > 0) {
    sp.spray--;
    for (let i = 0; i < 2; i++) {
      sp.mist.push({ x: pl.x + pl.w * (0.15 + Math.random() * 0.7), y: pl.y + pl.h, vx: (Math.random() - 0.5) * 1.6, vy: 5 + Math.random() * 2, t: 0, settled: 0 });
    }
  }
  sp.mist.forEach((m) => {
    m.t++;
    if (m.settled) {
      m.settled++;
      m.x -= fl.speed;
      return;
    }
    m.y += m.vy;
    m.x += m.vx - fl.speed * 0.6;
    if (m.y >= SETTLE_Y) {
      m.y = SETTLE_Y + Math.random() * 12;
      m.settled = 1;
    }
  });
  sp.mist = sp.mist.filter((m) => (m.settled ? m.settled < SETTLE_FRAMES : m.t < 160) && m.x > -60);

  for (const it of sp.pickups) {
    if (it.taken) continue;
    if (!it.live && fl.dist + VIEW_W + 40 >= it.at) {
      it.live = true;
      it.x = VIEW_W + 40;
    }
    if (!it.live) continue;
    it.x -= fl.speed;
    if (it.x < -40) it.taken = true;
    if (Math.abs(it.x - (pl.x + pl.w / 2)) < 60 && Math.abs(it.y - (pl.y + pl.h / 2)) < 40) {
      it.taken = true;
      sp.spray = SPRAY_FRAMES;
      eng.score += 50;
      eng.hooks.onSound?.('power');
    }
  }

  for (const b of sp.bugs) {
    if (b.gone) continue;
    if (!b.live && fl.dist + VIEW_W + 40 >= b.at) {
      b.live = true;
      b.x = VIEW_W + 40;
    }
    if (!b.live) continue;
    b.x -= fl.speed;
    if (b.x < -60) b.gone = true;
    if (b.dead) {
      b.deadT++;
      continue;
    }
    // só morre quando a nuvem de calda assentada encosta nele
    if (sp.mist.some((m) => m.settled && Math.abs(m.x - b.x) < HIT_R)) {
      b.dead = true;
      eng.score += 100;
      eng.sprayed = (eng.sprayed ?? 0) + 1;
      fl.booms.push({ x: b.x, y: GROUND_Y - 24, t: 0, s: 0.6 });
      eng.hooks.onSound?.('stomp');
    }
  }
}

// atrás das fileiras de algodão: só a cabeça do bicudo aparece entre as plantas
export function drawHiddenBugs(ctx, fl, time) {
  const art = getSprite(ART.weevil);
  if (!art) return;
  fl.sp.bugs.forEach((b) => {
    if (!b.live || b.gone || b.deadT > 30) return;
    const peek = b.dead ? -b.deadT * 2 : (Math.sin(time * 2.4 + b.seed) * 0.5 + 0.5) * 26;
    ctx.globalAlpha = b.dead ? Math.max(0, 1 - b.deadT / 30) : 1;
    drawSprite(ctx, art, b.x, GROUND_Y + 14 - peek, 62, { dir: -1, anchorY: 1 });
    ctx.globalAlpha = 1;
  });
}

function outlinedText(ctx, text, x, y, size, fill) {
  ctx.font = `900 ${size}px "Baloo 2", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

export function drawSprayFront(ctx, fl, time) {
  const sp = fl.sp;
  sp.pickups.forEach((it) => {
    if (!it.live || it.taken) return;
    star(ctx, it.x, it.y, 10, 26, 14, time);
    ctx.fillStyle = '#FFC93A';
    ctx.fill();
    ink(ctx, 2.2);
    puffCluster(ctx, it.x, it.y, [[0, 0, 8], [-5, 2, 6], [5, 2, 6]], 1, '#FFD24A');
    // gotinha: avisa que é o poder de pulverizar
    ctx.beginPath();
    ctx.moveTo(it.x + 20, it.y - 26);
    ctx.quadraticCurveTo(it.x + 29, it.y - 12, it.x + 20, it.y - 8);
    ctx.quadraticCurveTo(it.x + 11, it.y - 12, it.x + 20, it.y - 26);
    ctx.fillStyle = '#5AB8F0';
    ctx.fill();
    ink(ctx, 2);
  });
  sp.mist.forEach((m) => {
    if (m.settled) {
      // nuvem baixa sobre as plantas: cresce e some devagar
      const k = m.settled / SETTLE_FRAMES;
      ctx.globalAlpha = 0.5 * (1 - k);
      ctx.fillStyle = '#D6F1FF';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, 14 + k * 22, 9 + k * 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#BFE8FF';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  // bicudo atingido: +100 subindo em azul
  sp.bugs.forEach((b) => {
    if (!b.dead || b.deadT > 36) return;
    ctx.globalAlpha = 1 - b.deadT / 36;
    outlinedText(ctx, '+100', b.x, GROUND_Y - 50 - b.deadT, 16, '#7BE0FF');
    ctx.globalAlpha = 1;
  });
  if (sp.spray > 0) {
    const pl = fl.plane;
    outlinedText(ctx, 'PULVERIZANDO!', pl.x + pl.w / 2, pl.y - 30, 14, '#7BE0FF');
  }
}

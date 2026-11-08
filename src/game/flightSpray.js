import { VIEW_W, TILE } from './config';
import { INK, ink } from './brush';
import { ART, getSprite, drawSprite } from './sprites';
import { GROUND_Y } from './flightGround';

// Pulverização (a mecânica educativa da fase): a gotinha azul enche o tanque de calda; segurando
// PULVERIZAR o avião solta a calda pelas barras sob as asas. Voando BAIXO a calda assenta na
// lavoura e acaba com os bicudos escondidos; voando ALTO o vento leva a calda (DERIVA) e nada acontece.
const TANK_PER_FRAME = 0.4; // tanque cheio (100) dura ~4 s de pulverização
const GAP = 95;
const SETTLE_Y = GROUND_Y - 52; // altura das copas, onde os bicudos aparecem
const SETTLE_FRAMES = 60;
const HIT_R = 50;
// acima desta altura sobre as copas a calda vira deriva
export const DRIFT_ABOVE = 150;

export function initSpray(def) {
  const nests = def.nests ?? [];
  return {
    tank: 0,
    spraying: false,
    drifting: false,
    tipT: 0,
    tipShown: false,
    driftMsgT: 0,
    mist: [],
    pickups: nests.map((n) => ({ at: (n.at - 8) * TILE, y: (n.y ?? 7) * TILE + 24, x: 0, live: false, taken: false })),
    bugs: nests.flatMap((n) =>
      Array.from({ length: n.n ?? 3 }, (_, i) => ({ at: n.at * TILE + i * GAP, x: 0, live: false, gone: false, dead: false, deadT: 0, seed: i * 1.9 + n.at })),
    ),
  };
}

export const planeAltitude = (pl) => SETTLE_Y - (pl.y + pl.h);

export function updateSpray(eng) {
  const fl = eng.fl;
  const sp = fl.sp;
  const pl = fl.plane;
  const inp = eng.input;
  if (sp.tipT > 0) sp.tipT--;
  if (sp.driftMsgT > 0) sp.driftMsgT--;
  sp.spraying = !!inp.throw && sp.tank > 0 && !fl.boss?.dead;
  sp.drifting = sp.spraying && planeAltitude(pl) > DRIFT_ABOVE;
  if (sp.spraying) {
    sp.tank = Math.max(0, sp.tank - TANK_PER_FRAME);
    if (sp.drifting) sp.driftMsgT = 40;
    // dois leques de gotas, um em cada barra sob a asa
    [0.3, 0.62].forEach((k) => {
      sp.mist.push({
        x: pl.x + pl.w * k + (Math.random() - 0.5) * 16,
        y: pl.y + pl.h - 2,
        vx: (Math.random() - 0.5) * 1.4,
        vy: sp.drifting ? 2 + Math.random() : 5 + Math.random() * 2,
        r: 2 + Math.random() * 2,
        t: 0,
        settled: 0,
        drift: sp.drifting,
      });
    });
  }
  sp.mist.forEach((m) => {
    m.t++;
    if (m.settled) {
      m.settled++;
      m.x -= fl.speed;
      return;
    }
    // deriva: o vento empurra a calda para trás e ela se espalha sem chegar no alvo
    if (m.drift) {
      m.vx -= 0.12;
      m.vy *= 0.97;
      m.r += 0.25;
    }
    m.y += m.vy;
    m.x += m.vx - fl.speed * 0.6;
    if (!m.drift && m.y >= SETTLE_Y) {
      m.y = SETTLE_Y + Math.random() * 14;
      m.settled = 1;
    }
  });
  sp.mist = sp.mist.filter((m) => (m.settled ? m.settled < SETTLE_FRAMES : m.t < (m.drift ? 70 : 160)) && m.x > -60);

  for (const it of sp.pickups) {
    if (it.taken) continue;
    if (!it.live && fl.dist + VIEW_W + 40 >= it.at) {
      it.live = true;
      it.x = VIEW_W + 40;
    }
    if (!it.live) continue;
    it.x -= fl.speed;
    if (it.x < -40) it.taken = true;
    if (Math.abs(it.x - (pl.x + pl.w / 2)) < 70 && Math.abs(it.y - (pl.y + pl.h / 2)) < 54) {
      it.taken = true;
      sp.tank = 100;
      eng.score += 50;
      eng.hooks.onSound?.('power');
      // primeira gotinha: ensina como pulverizar
      if (!sp.tipShown) {
        sp.tipShown = true;
        sp.tipT = 330;
      }
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
    // só morre quando a calda assentada (sem deriva) encosta nele
    if (sp.mist.some((m) => m.settled && !m.drift && Math.abs(m.x - b.x) < HIT_R)) {
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

export function outlinedText(ctx, text, x, y, size, fill, align = 'center') {
  ctx.font = `900 ${size}px "Baloo 2", system-ui, sans-serif`;
  ctx.textAlign = align;
  ctx.lineWidth = Math.max(4, size / 4);
  ctx.lineJoin = 'round';
  ctx.strokeStyle = INK;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

function drop(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x, y - 12 * s);
  ctx.quadraticCurveTo(x + 9 * s, y + 2 * s, x, y + 6 * s);
  ctx.quadraticCurveTo(x - 9 * s, y + 2 * s, x, y - 12 * s);
}

// gotinha azul: bolha de calda (não se confunde com os capulhos amarelos)
function drawTankPickup(ctx, it, time) {
  const bob = Math.sin(time * 3 + it.at) * 4;
  const x = it.x;
  const y = it.y + bob;
  const g = ctx.createRadialGradient(x, y, 6, x, y, 36);
  g.addColorStop(0, 'rgba(120, 210, 255, 0.55)');
  g.addColorStop(1, 'rgba(120, 210, 255, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#2E9BE0';
  ctx.fill();
  ink(ctx, 2.4);
  drop(ctx, x, y + 2, 1.15);
  ctx.fillStyle = '#E8F7FF';
  ctx.fill();
  ink(ctx, 1.6);
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(x - 8, y - 9, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSprayFront(ctx, fl, time) {
  const sp = fl.sp;
  const pl = fl.plane;
  sp.pickups.forEach((it) => {
    if (!it.live || it.taken) return;
    drawTankPickup(ctx, it, time);
    // antes da primeira: avisa o que é
    if (!sp.tipShown && it.x < VIEW_W - 30) outlinedText(ctx, 'CALDA!', it.x, it.y - 34 + Math.sin(time * 5) * 3, 15, '#7BD3FF');
  });
  // névoa: gotas caindo e tufos azulados assentando sobre as copas
  sp.mist.forEach((m) => {
    if (m.settled) {
      const k = m.settled / SETTLE_FRAMES;
      ctx.globalAlpha = 0.42 * (1 - k);
      ctx.fillStyle = '#CFEFFF';
      ctx.beginPath();
      const r = 10 + k * 16;
      ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
      ctx.arc(m.x - r * 0.9, m.y + 4, r * 0.7, 0, Math.PI * 2);
      ctx.arc(m.x + r * 0.9, m.y + 3, r * 0.75, 0, Math.PI * 2);
      ctx.fill();
    } else if (m.drift) {
      ctx.globalAlpha = 0.35 * (1 - m.t / 70);
      ctx.fillStyle = '#E4F4FF';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#9ADCFF';
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.r * 0.7, m.r * 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  // "!" nos bicudos escondidos que estão chegando: alvo da pulverização
  sp.bugs.forEach((b) => {
    if (!b.live || b.gone || b.dead || b.x < pl.x - 20 || b.x > pl.x + 520) return;
    const y = GROUND_Y - 62 + Math.sin(time * 8 + b.seed) * 3;
    ctx.beginPath();
    ctx.arc(b.x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#F0273A';
    ctx.fill();
    ink(ctx, 2);
    ctx.font = '900 15px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('!', b.x, y + 5);
    ctx.textAlign = 'left';
  });
  // bicudo atingido: +100 subindo em azul
  sp.bugs.forEach((b) => {
    if (!b.dead || b.deadT > 36) return;
    ctx.globalAlpha = 1 - b.deadT / 36;
    outlinedText(ctx, '+100', b.x, GROUND_Y - 50 - b.deadT, 16, '#7BE0FF');
    ctx.globalAlpha = 1;
  });
  // medidor de calda preso ao avião
  if (sp.tank > 0) {
    const w = 70;
    const x = pl.x + pl.w / 2 - w / 2;
    const y = pl.y - 26;
    ctx.beginPath();
    ctx.roundRect?.(x, y, w, 9, 5);
    ctx.fillStyle = '#123A55';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect?.(x + 1.5, y + 1.5, (w - 3) * (sp.tank / 100), 6, 3);
    ctx.fillStyle = '#4FC3FF';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect?.(x, y, w, 9, 5);
    ink(ctx, 1.6);
    drop(ctx, x - 9, y + 5, 0.55);
    ctx.fillStyle = '#4FC3FF';
    ctx.fill();
    ink(ctx, 1.2);
  }
  if (sp.driftMsgT > 0) outlinedText(ctx, 'DERIVA! Voe mais baixo', pl.x + pl.w / 2, pl.y - 36, 15, '#FFB13B');
  else if (sp.spraying) outlinedText(ctx, 'PULVERIZANDO!', pl.x + pl.w / 2, pl.y - 34, 14, '#7BE0FF');
}

// faixa de dica (primeira gotinha) e barra de progresso do voo
export function drawFlightHelp(ctx, fl, time, touch) {
  const sp = fl.sp;
  if (sp.tipT > 0) {
    const a = Math.min(1, sp.tipT / 30, (330 - sp.tipT) / 15);
    ctx.globalAlpha = a;
    const w = 560;
    const x = (VIEW_W - w) / 2;
    ctx.beginPath();
    ctx.roundRect?.(x, 58, w, 54, 16);
    ctx.fillStyle = 'rgba(255, 253, 247, 0.95)';
    ctx.fill();
    ink(ctx, 2.4);
    ctx.font = '900 19px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.fillText(touch ? 'Segure o botão azul PULVERIZAR' : 'Segure K ou C para PULVERIZAR', VIEW_W / 2, 80);
    ctx.font = '800 15px "Nunito", system-ui, sans-serif';
    ctx.fillStyle = '#1F6FA8';
    ctx.fillText('Voe BAIXO sobre a lavoura: alto demais o vento leva a calda (deriva)', VIEW_W / 2, 101);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }
  // progresso: avião andando até o chefão (some quando ele chega)
  if (!fl.boss) {
    const w = 260;
    const x = (VIEW_W - w) / 2;
    const y = 14;
    const k = Math.min(1, fl.dist / fl.length);
    ctx.beginPath();
    ctx.roundRect?.(x, y, w, 8, 4);
    ctx.fillStyle = 'rgba(27, 18, 12, 0.35)';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect?.(x, y, w * k, 8, 4);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect?.(x, y, w, 8, 4);
    ink(ctx, 1.6);
    // marcador do avião e caveirinha do chefão no fim
    ctx.beginPath();
    ctx.arc(x + w * k, y + 4, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#FFC41F';
    ctx.fill();
    ink(ctx, 1.6);
    ctx.beginPath();
    ctx.arc(x + w + 12, y + 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#9B5BD4';
    ctx.fill();
    ink(ctx, 1.6);
    ctx.font = '900 10px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('B', x + w + 12, y + 8);
    ctx.textAlign = 'left';
  }
}

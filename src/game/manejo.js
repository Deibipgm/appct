import { TILE, VIEW_W } from './config';
import { INK, rr } from './brush';
import { emitCotton, emitDirt, emitLeaves } from './fx';
import { toast } from './tutorial';
import { ART, getSprite } from './sprites';

// Fase 5 "Operação Campo Limpo" (fitossanitário): as práticas da entressafra contra o bicudo.
//  1. Destruir soqueiras: tocos e restos da lavoura que abrigam o bicudo. O Dão soca ou pisa.
//  2. Monitorar armadilhas: a armadilha de feromônio atrai os bicudos por perto.
//  3. Eliminar tigueras: algodoeiros voluntários que nascem fora de época.
//  4. Cobrir a carga: o caminhão de algodão sai com a lona fechada (sem semente na estrada).
//  Desafio final: o Bicudão está escondido em um dos montes de restos da lavoura.
const LURE_RANGE = 9 * TILE;
const PUNCH_FRAMES = 20;
const PUNCH_REACH = 50;
const GIVE_UP = 60 * 25; // o Bicudão sai sozinho se o Dão demorar demais no esconde-esconde

const BUG_LIFE = 600; // joaninhas ficam 10 s com o Dão
const BUG_SPEED = 6.5;
const JAR_RESPAWN = 60 * 18;
const PTS = { soqueira: 50, tiguera: 50, bicudo: 100, carga: 200, tudo: 500 };

export function initManejo(eng) {
  const lv = eng.level;
  const gy = lv.groundTop * TILE;
  const px = (x) => x * TILE + TILE / 2;
  eng.traps = (lv.traps ?? []).map((x) => ({ x: px(x), y: gy, active: false, caught: 0, t: 0 }));
  eng.soqueiras = (lv.soqueiras ?? []).map((s) => ({ x: px(s.x ?? s), y: gy, bug: !!s.bug, gone: false, hp: 2, cd: 0, shake: 0, t: 0 }));
  eng.jars = (lv.jars ?? []).map((j) => ({ x: px(j.x ?? j), y: gy, used: false, again: 0, respawn: !!j.respawn }));
  eng.ladybugs = [];
  eng.tigueras = (lv.tigueras ?? []).map((x) => ({ x: px(x), y: gy, gone: false, t: 0, seed: x }));
  eng.truck = lv.truck ? { x: lv.truck * TILE, y: gy, covered: false, t: 0 } : null;
  eng.piles = (lv.piles ?? []).map((x) => ({ x: px(x), y: gy, gone: false, shake: 0 }));
  eng.pilesBroken = 0;
  eng.toastY = 150;
  eng.arenaT = 0;
  eng.popups = [];
  eng.manejoTips = {};
  eng.missionDone = false;
  if (!eng.traps.length && !eng.soqueiras.length) {
    eng.traps = null;
    eng.toastY = null;
  }
}

function tipOnce(eng, id, text) {
  if (eng.manejoTips[id]) return;
  eng.manejoTips[id] = true;
  toast(eng, text);
}

function popup(eng, x, y, text, color = '#FFD23F') {
  eng.popups.push({ x, y, text, color, t: 0 });
}

// o punho do Dão (meio do soco) ou o pisão por cima acertam um alvo no chão de altura h
function hitByDao(eng, x, w, h) {
  const p = eng.player;
  const top = eng.level.groundTop * TILE - h;
  if (p.punchT > 4 && p.punchT < PUNCH_FRAMES - 3) {
    const x1 = p.face > 0 ? p.x + p.w - 6 : p.x - PUNCH_REACH;
    const x2 = p.face > 0 ? p.x + p.w + PUNCH_REACH : p.x + 6;
    if (x + w / 2 > x1 && x - w / 2 < x2 && p.y + p.h > top - 10) return 'punch';
  }
  const over = p.x + p.w > x - w / 2 && p.x < x + w / 2;
  if (over && p.vy > 1 && p.y + p.h >= top - 6 && p.y + p.h <= top + 26) return 'stomp';
  return null;
}

function spawnBicudo(eng, x) {
  const gy = eng.level.groundTop * TILE;
  eng.enemies.push({
    type: 'weevil', x: x - 20, y: gy - 40, baseY: gy - 40, w: 40, h: 40, vx: 1.15,
    minX: x - 20 - TILE, maxX: x + TILE + 20, t: 0, seed: eng.enemies.length, speed: 1.15,
    mode: 'hover', diveT: 0, alert: false, dead: false, deadT: 0,
  });
}

function count(arr, f) {
  return arr.reduce((n, a) => n + (f(a) ? 1 : 0), 0);
}

export function missionStatus(eng) {
  if (!eng.traps) return null;
  return {
    soqueiras: [count(eng.soqueiras, (s) => s.gone), eng.soqueiras.length],
    armadilhas: [count(eng.traps, (t) => t.active), eng.traps.length],
    tigueras: [count(eng.tigueras, (t) => t.gone), eng.tigueras.length],
    carga: [eng.truck?.covered ? 1 : 0, eng.truck ? 1 : 0],
  };
}

function checkMission(eng) {
  if (eng.missionDone) return;
  const m = missionStatus(eng);
  if (Object.values(m).every(([a, b]) => a >= b)) {
    eng.missionDone = true;
    eng.score += PTS.tudo;
    const p = eng.player;
    popup(eng, p.x + p.w / 2, p.y - 30, `+${PTS.tudo} MISSÃO COMPLETA!`, '#7CE05A');
    toast(eng, 'Operação Campo Limpo completa! Agora ache o Bicudão.');
    eng.hooks.onSound?.('gate');
    eng.emitHud();
  }
}

export function updateManejo(eng) {
  if (!eng.traps) return;
  const p = eng.player;
  const pc = p.x + p.w / 2;
  const near = (x, d = 5) => x - pc > 0 && x - pc < d * TILE;

  eng.popups = eng.popups.filter((u) => ++u.t < 60);

  // dicas no primeiro contato
  if (eng.soqueiras.some((s) => !s.gone && near(s.x))) tipOnce(eng, 'soq', 'Soqueira! Soque ou pise para destruir o abrigo do bicudo.');
  if (eng.traps.some((t) => !t.active && near(t.x))) tipOnce(eng, 'trap', 'Encoste na armadilha: o feromônio atrai os bicudos!');
  if (eng.tigueras.some((t) => !t.gone && near(t.x))) tipOnce(eng, 'tig', 'Tiguera: algodão fora de época. Arranque com soco ou pisão!');
  if (eng.jars.some((j) => !j.used && near(j.x))) tipOnce(eng, 'jar', 'Pegue o pote de joaninhas: elas comem as moscas-brancas!');
  if (eng.truck && !eng.truck.covered && near(eng.truck.x, 6)) tipOnce(eng, 'truck', 'Encoste no caminhão para cobrir a carga com a lona.');

  // soqueiras
  for (const s of eng.soqueiras) {
    s.t++;
    if (s.shake > 0) s.shake--;
    if (s.cd > 0) s.cd--;
    if (s.gone || s.cd > 0) continue;
    const hit = hitByDao(eng, s.x, 70, s.hp > 1 ? 70 : 40);
    if (!hit) continue;
    if (hit === 'stomp') p.vy = -10;
    s.cd = 16;
    s.shake = 10;
    if (--s.hp > 0) {
      // 1º golpe: os galhos caem e sobram os tocos
      emitDirt(eng, s.x, s.y - 30, 6);
      emitLeaves(eng, s.x, s.y - 50, 4);
      popup(eng, s.x, s.y - 80, 'Mais um!', '#FFFDF7');
      eng.hooks.onSound?.('block');
      continue;
    }
    s.gone = true;
    eng.score += PTS.soqueira;
    popup(eng, s.x, s.y - 70, `+${PTS.soqueira}`);
    emitDirt(eng, s.x, s.y - 20, 10);
    emitLeaves(eng, s.x, s.y - 30, 5);
    eng.shake = Math.max(eng.shake, 4);
    eng.hitStop = 3;
    eng.hooks.onSound?.('block');
    if (s.bug) {
      spawnBicudo(eng, s.x);
      popup(eng, s.x, s.y - 100, 'Tinha bicudo escondido!', '#FFFDF7');
    }
    eng.emitHud();
    checkMission(eng);
  }

  // tigueras
  for (const tg of eng.tigueras) {
    tg.t++;
    if (tg.gone) continue;
    const hit = hitByDao(eng, tg.x, 36, 56);
    if (!hit) continue;
    tg.gone = true;
    tg.flyT = 0;
    if (hit === 'stomp') p.vy = -10;
    eng.score += PTS.tiguera;
    popup(eng, tg.x, tg.y - 80, `+${PTS.tiguera}`);
    emitLeaves(eng, tg.x, tg.y - 30, 8);
    emitDirt(eng, tg.x, tg.y, 5);
    eng.hooks.onSound?.('stomp');
    eng.emitHud();
    checkMission(eng);
  }

  // potes de joaninhas
  for (const j of eng.jars) {
    if (j.used) {
      if (j.respawn && --j.again <= 0 && !eng.ladybugs.length) j.used = false;
      continue;
    }
    if (Math.abs(pc - j.x) < 28 && Math.abs(p.y + p.h - j.y) < 70) {
      j.used = true;
      j.again = JAR_RESPAWN;
      for (let i = 0; i < 3; i++) {
        eng.ladybugs.push({ x: j.x, y: j.y - 30, a: (i * Math.PI * 2) / 3, t: 0, state: 'orbit', target: null, life: BUG_LIFE });
      }
            emitCotton(eng, j.x, j.y - 30, 6);
      eng.hooks.onSound?.('power');
      eng.emitHud();
    }
  }

  // joaninhas
  const taken = new Set(eng.ladybugs.map((b) => b.target).filter(Boolean));
  eng.ladybugs = eng.ladybugs.filter((b) => {
    b.t++;
    b.life--;
    if (b.life <= 0 && b.state !== 'leave') b.state = 'leave';
    if (b.state === 'leave') {
      b.y -= 3.5;
      b.x += Math.sin(b.t * 0.2) * 2;
      return b.y > -60;
    }
    if (b.state === 'orbit') {
      b.a += 0.06;
      const tx = pc + Math.cos(b.a) * 46;
      const ty = p.y - 10 + Math.sin(b.a * 2) * 14;
      b.x += (tx - b.x) * 0.15;
      b.y += (ty - b.y) * 0.15;
      if (b.t % 10 === 0) {
        const prey = eng.enemies
          .filter((e) => !e.dead && (e.type === 'whitefly' || e.skin === 'cochonilha') && !taken.has(e))
          .map((e) => ({ e, d: Math.hypot(e.x + e.w / 2 - b.x, e.y + e.h / 2 - b.y) }))
          .filter((o) => o.d < 300)
          .sort((u, v) => u.d - v.d)[0];
        if (prey) {
          b.target = prey.e;
          taken.add(prey.e);
          b.state = 'attack';
        }
      }
      return true;
    }
    // ataque
    const tgt = b.target;
    if (!tgt || tgt.dead) {
      b.state = 'orbit';
      b.target = null;
      return true;
    }
    const tx = tgt.x + tgt.w / 2;
    const ty = tgt.y + tgt.h / 2;
    const d = Math.hypot(tx - b.x, ty - b.y);
    b.x += ((tx - b.x) / (d || 1)) * BUG_SPEED;
    b.y += ((ty - b.y) / (d || 1)) * BUG_SPEED;
    if (d < 16) {
      tgt.dead = true;
      tgt.deadT = 0;
      eng.score += 60;
      popup(eng, tx, ty - 20, '+60 joaninha!', '#FF6B6B');
      eng.pows.push({ x: tx, y: ty, t: 0 });
      emitCotton(eng, tx, ty, 5);
      eng.hooks.onSound?.('stomp');
      eng.emitHud();
      b.state = 'orbit';
      b.target = null;
    }
    return true;
  });

  // armadilhas: só o bicudo que morre preso nela vale pontos
  for (const tr of eng.traps) {
    tr.t++;
    if (!tr.active && Math.abs(pc - tr.x) < 26 && p.y + p.h > tr.y - 90) {
      tr.active = true;
      tr.t = 0;
      emitCotton(eng, tr.x, tr.y - 120, 8);
      eng.hooks.onSound?.('power');
      toast(eng, 'Feromônio no ar! Os bicudos vão para a armadilha.');
      checkMission(eng);
    }
    if (!tr.active) continue;
    for (const e of eng.enemies) {
      if (e.dead || e.type !== 'weevil' || e.skin) continue;
      const d = tr.x - (e.x + e.w / 2);
      if (Math.abs(d) > LURE_RANGE) continue;
      e.lured = true;
      e.minX = Math.min(e.minX, tr.x - e.w);
      e.maxX = Math.max(e.maxX, tr.x + e.w);
      e.vx = Math.sign(d || 1) * Math.max(1.6, Math.abs(e.vx));
      if (Math.abs(d) < 12) {
        e.dead = true;
        e.deadT = 0;
        tr.caught++;
        eng.score += PTS.bicudo;
        popup(eng, tr.x, tr.y - 250, `+${PTS.bicudo} bicudo na armadilha!`);
        eng.pows.push({ x: tr.x, y: tr.y - 60, t: 0 });
        emitLeaves(eng, tr.x, tr.y - 40, 4);
        eng.hooks.onSound?.('stomp');
        eng.emitHud();
      }
    }
  }

  // caminhão: encostar cobre a carga com a lona
  const tk = eng.truck;
  if (tk) {
    tk.t++;
    if (!tk.covered) {
      if (pc > tk.x && pc < tk.x + TRUCK_W) {
        tk.covered = true;
        tk.coverT = 0;
        eng.score += PTS.carga;
        popup(eng, tk.x + TRUCK_W * 0.42, tk.y - 140, `+${PTS.carga} carga coberta!`);
        toast(eng, 'Carga coberta: nenhuma semente cai na estrada!');
        eng.hooks.onSound?.('gate');
        eng.emitHud();
        checkMission(eng);
      } else if (tk.t % 14 === 0) {
        // fiapos de pluma voando da carga descoberta
        emitCotton(eng, tk.x + TRUCK_W * (0.1 + Math.random() * 0.6), tk.y - 100, 1);
      }
    } else tk.coverT++;
  }

  // desafio final: o Bicudão escondido em um dos montes
  const b = eng.boss;
  if (b && b.hidden && eng.piles.length) {
    if (pc > b.minX - TILE) {
      eng.arenaT++;
      tipOnce(eng, 'piles', 'O Bicudão se escondeu nos restos da lavoura! Soque os montes.');
    }
    for (const pl of eng.piles) {
      if (pl.gone) continue;
      if (Math.random() < 0.006) pl.shake = 20; // os montes se mexem: é um palpite!
      if (pl.shake > 0) pl.shake--;
      const hit = hitByDao(eng, pl.x, 70, 76);
      if (!hit) continue;
      pl.gone = true;
      if (hit === 'stomp') p.vy = -11;
      eng.pilesBroken++;
      emitDirt(eng, pl.x, pl.y - 30, 14);
      emitLeaves(eng, pl.x, pl.y - 40, 6);
      eng.shake = Math.max(eng.shake, 6);
      eng.hooks.onSound?.('block');
      const left = count(eng.piles, (q) => !q.gone);
      const found = left === 0 || (eng.pilesBroken >= 2 && Math.random() < 0.5);
      if (found) revealBoss(eng, pl.x);
      else popup(eng, pl.x, pl.y - 110, 'Aqui não!', '#FFFDF7');
      break;
    }
    if (b.hidden && eng.arenaT > GIVE_UP) {
      const pl = eng.piles.find((q) => !q.gone);
      if (pl) {
        pl.gone = true;
        revealBoss(eng, pl.x);
      }
    }
  }
}

function revealBoss(eng, x) {
  const b = eng.boss;
  b.hidden = false;
  b.active = true;
  b.x = Math.max(b.minX, Math.min(b.maxX - b.w, x - b.w / 2));
  b.y = b.ground - b.h;
  b.state = 'intro';
  b.timer = 70;
  eng.shake = 14;
  emitDirt(eng, x, b.ground - 40, 20);
  popup(eng, x, b.ground - 190, 'ACHOU O BICUDÃO!', '#F0273A');
  eng.hooks.onSound?.('hurt');
}

// ---------- desenho ----------

// Armadilha solar de feromônio (arte do usuário), plantada no chão.
const TRAP_H = 230;
function drawTrap(ctx, tr, x, time) {
  const gy = tr.y;
  if (tr.active) {
    for (let i = 0; i < 3; i++) {
      const k = (time * 0.6 + i / 3) % 1;
      ctx.beginPath();
      ctx.ellipse(x, gy - 170, 20 + k * 120, 10 + k * 46, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 120, 190, ${0.55 * (1 - k)})`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
  const img = getSprite(ART.armadilha);
  if (img) {
    const w = (TRAP_H * img.naturalWidth) / img.naturalHeight;
    ctx.drawImage(img, x - w / 2, gy - TRAP_H + 6, w, TRAP_H);
  }
  label(ctx, tr.active ? (tr.caught ? `${tr.caught} bicudo${tr.caught > 1 ? 's' : ''}!` : 'ATIVA') : 'ARMADILHA', x, gy - TRAP_H - 4, tr.active ? '#FFD23F' : '#FFFDF7');
}

function label(ctx, text, x, y, color) {
  ctx.font = '900 13px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

// tocos secos cortados (soqueira), com um capulho velho aqui e ali
function drawStalks(ctx, x, gy, n, h, spread, seed, shake = 0) {
  for (let i = 0; i < n; i++) {
    const r = Math.sin(seed * 13.7 + i * 7.1) * 0.5 + 0.5;
    const sx = x + (i - (n - 1) / 2) * spread + Math.sin(i * 3 + shake) * (shake ? 2 : 0);
    const sh = h * (0.6 + r * 0.4);
    const lean = (r - 0.5) * 0.35;
    ctx.save();
    ctx.translate(sx, gy);
    ctx.rotate(lean);
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(-2, -sh);
    ctx.lineTo(3, -sh - 4);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? '#B9874A' : '#9C6B35';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    // galhinho em forquilha
    ctx.beginPath();
    ctx.moveTo(0, -sh * 0.6);
    ctx.lineTo(9 * (r > 0.5 ? 1 : -1), -sh * 0.85);
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }
}

function drawOldBoll(ctx, x, y, s = 1) {
  ctx.fillStyle = '#7A5530';
  ctx.beginPath();
  ctx.arc(x, y + 3 * s, 6 * s, 0, Math.PI * 2);
  ctx.fill();
  [[-4, 0], [4, 0], [0, -4]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, 5 * s, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
}

const SOQ_SCALE = 0.5;
function drawSoqueira(ctx, s, x) {
  const img = getSprite(s.gone ? ART.soqueira3 : s.hp > 1 ? ART.soqueira1 : ART.soqueira2);
  const jig = s.shake ? Math.sin(s.shake * 2.2) * s.shake * 0.5 : 0;
  if (img) {
    const w = img.naturalWidth * SOQ_SCALE;
    const h = img.naturalHeight * SOQ_SCALE;
    ctx.drawImage(img, x - w / 2 + jig, s.y - h + 6, w, h);
  }
  if (!s.gone && s.bug && Math.floor(s.t / 40) % 4 === 0) {
    // olhinhos do bicudo espiando lá dentro
    const ey = s.y - (s.hp > 1 ? 22 : 16);
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(x - 5, ey, 3.4, 0, Math.PI * 2);
    ctx.arc(x + 4, ey, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(x - 5, ey, 1.6, 0, Math.PI * 2);
    ctx.arc(x + 4, ey, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

// tiguera: pé de algodão novo, nascido fora de época, com um capulho em cima
function drawTiguera(ctx, tg, x, time) {
  if (tg.gone) {
    // arrancada: sobe girando e some
    tg.flyT = (tg.flyT ?? 0) + 1;
    if (tg.flyT > 40) return;
    ctx.save();
    ctx.globalAlpha = 1 - tg.flyT / 40;
    ctx.translate(x + tg.flyT * 2, tg.y - tg.flyT * 4);
    ctx.rotate(tg.flyT * 0.2);
    ctx.translate(-x, -tg.y);
  } else ctx.save();
  const sway = Math.sin(time * 2 + tg.seed) * 0.08;
  ctx.translate(x, tg.y);
  ctx.rotate(sway);
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.quadraticCurveTo(-4, -26, -1, -48);
  ctx.lineTo(2, -48);
  ctx.quadraticCurveTo(-1, -26, 2.5, 0);
  ctx.closePath();
  ctx.fillStyle = '#4E9A2E';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = INK;
  ctx.stroke();
  [[-1, -22, -1], [1, -32, 1]].forEach(([dx, dy, d]) => {
    ctx.beginPath();
    ctx.ellipse(dx + d * 12, dy, 12, 6, d * -0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#6CC43C';
    ctx.fill();
    ctx.stroke();
  });
  drawOldBoll(ctx, 0, -54, 1.1);
  ctx.restore();
  if (!tg.gone) label(ctx, '!', x, tg.y - 74 + Math.sin(time * 5 + tg.seed) * 3, '#FFD23F');
}

// caminhão com os rolos de algodão: arte aberta, e a lona verde cobrindo da cabine para trás
const TRUCK_W = 400;
const TRUCK_H = (TRUCK_W * 221) / 680;
function drawTruck(ctx, tk, x) {
  const gy = tk.y;
  const top = gy - TRUCK_H + 4;
  const open = getSprite(ART.caminhaoAberto);
  const lona = getSprite(ART.caminhaoLona);
  if (open) ctx.drawImage(open, x, top, TRUCK_W, TRUCK_H);
  if (tk.covered && lona) {
    const k = Math.min(1, (tk.coverT ?? 0) / 30);
    const cut = TRUCK_W * (1 - k);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + cut, top - 4, TRUCK_W - cut + 2, TRUCK_H + 8);
    ctx.clip();
    ctx.drawImage(lona, x, top, TRUCK_W, TRUCK_H);
    ctx.restore();
  }
  if (!tk.covered) label(ctx, 'COBRIR A CARGA', x + TRUCK_W * 0.42, top - 14, '#FFFDF7');
}

// monte de restos da lavoura (onde o Bicudão pode estar escondido)
function drawPile(ctx, pl, x) {
  if (pl.gone) return;
  const sh = pl.shake > 0 ? Math.sin(pl.shake * 1.7) * 3 : 0;
  ctx.save();
  ctx.translate(sh, 0);
  ctx.beginPath();
  ctx.ellipse(x, pl.y - 6, 44, 14, 0, Math.PI, 0);
  ctx.fillStyle = '#8B5E30';
  ctx.fill();
  drawStalks(ctx, x, pl.y, 9, 74, 9, pl.x, pl.shake);
  drawOldBoll(ctx, x - 22, pl.y - 52, 1);
  drawOldBoll(ctx, x + 18, pl.y - 62, 1.1);
  drawOldBoll(ctx, x + 2, pl.y - 30, 0.9);
  ctx.restore();
  label(ctx, '?', x, pl.y - 92, '#FFD23F');
}

function drawJar(ctx, j, x, time) {
  if (j.used) return;
  const gy = j.y;
  const bob = Math.sin(time * 3 + j.x) * 3;
  const y = gy - 46 + bob;
  // brilho
  const g = ctx.createRadialGradient(x, y, 4, x, y, 46);
  g.addColorStop(0, 'rgba(255, 230, 120, 0.7)');
  g.addColorStop(1, 'rgba(255, 230, 120, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  ctx.fill();
  // pote de vidro
  ctx.beginPath();
  rr(ctx, x - 17, y - 16, 34, 38, 9);
  ctx.fillStyle = 'rgba(210, 240, 255, 0.85)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  // tampa
  ctx.beginPath();
  rr(ctx, x - 14, y - 24, 28, 9, 3);
  ctx.fillStyle = '#3F8A3C';
  ctx.fill();
  ctx.stroke();
  // joaninhas dentro
  for (let i = 0; i < 3; i++) {
    drawLadybug(ctx, x - 8 + i * 8, y - 2 + (i % 2) * 9, 0.55, time * 2 + i, 1);
  }
}

export function drawLadybug(ctx, x, y, s, t, dir = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * dir, s);
  // asas transparentes batendo
  const flap = Math.abs(Math.sin(t * 22));
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(-6, -10, 9, 4 + flap * 4, -0.6, 0, Math.PI * 2);
  ctx.ellipse(6, -10, 9, 4 + flap * 4, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // cabeça
  ctx.beginPath();
  ctx.arc(11, 0, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#1B120C';
  ctx.fill();
  // corpo vermelho
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#E8262E';
  ctx.fill();
  ctx.lineWidth = 2.6;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(0, 11);
  ctx.stroke();
  ctx.fillStyle = INK;
  [[-6, -4, 2.6], [5, -5, 2.4], [-5, 5, 2.4], [6, 4, 2.6]].forEach(([dx, dy, r]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
  });
  // olhinhos
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(13, -2, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// atrás dos inimigos: armadilhas, soqueiras, tigueras, caminhão e montes
export function drawManejoProps(ctx, eng) {
  if (!eng.traps) return;
  const time = eng.time;
  const cam = eng.camera;
  const vis = (x, m = 140) => x > -m && x < VIEW_W + m;
  if (eng.truck && vis(eng.truck.x - cam, 380)) {
    drawTruck(ctx, eng.truck, eng.truck.x - cam);
  }
  eng.soqueiras.forEach((s) => vis(s.x - cam) && drawSoqueira(ctx, s, s.x - cam));
  eng.tigueras.forEach((t) => vis(t.x - cam) && drawTiguera(ctx, t, t.x - cam, time));
  eng.traps.forEach((t) => vis(t.x - cam, 160) && drawTrap(ctx, t, t.x - cam, time));
  eng.piles.forEach((p) => vis(p.x - cam) && drawPile(ctx, p, p.x - cam));
  eng.jars.forEach((j) => vis(j.x - cam, 60) && drawJar(ctx, j, j.x - cam, time));
}

// na frente: pontos que sobem e o painel da missão
export function drawManejoFront(ctx, eng) {
  if (!eng.traps) return;
  drawLadybugs(ctx, eng);
  eng.popups.forEach((u) => {
    const k = u.t / 60;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (1 - k) * 2);
    ctx.font = '900 18px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK;
    const y = u.y - u.t * 1.2;
    ctx.strokeText(u.text, u.x - eng.camera, y);
    ctx.fillStyle = u.color;
    ctx.fillText(u.text, u.x - eng.camera, y);
    ctx.restore();
  });
  if (eng.finale) return;
  const m = missionStatus(eng);
  const rows = [
    ['Destruir soqueiras', m.soqueiras],
    ['Monitorar armadilhas', m.armadilhas],
    ['Eliminar tigueras', m.tigueras],
    ['Cobrir a carga', m.carga],
  ];
  const x = 12;
  const y = 12;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.beginPath();
  rr(ctx, x, y, 214, 112, 12);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.font = '900 13px "Baloo 2", system-ui, sans-serif';
  ctx.fillStyle = '#2F6B2A';
  ctx.fillText('OPERAÇÃO CAMPO LIMPO', x + 12, y + 20);
  ctx.font = '800 13px Nunito, system-ui, sans-serif';
  rows.forEach(([name, [a, b]], i) => {
    const ry = y + 42 + i * 20;
    const done = a >= b;
    ctx.beginPath();
    rr(ctx, x + 12, ry - 11, 14, 14, 3);
    ctx.fillStyle = done ? '#3F9A3C' : '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = INK;
    ctx.stroke();
    if (done) {
      ctx.beginPath();
      ctx.moveTo(x + 15, ry - 4);
      ctx.lineTo(x + 18, ry);
      ctx.lineTo(x + 24, ry - 8);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.4;
      ctx.stroke();
    }
    ctx.fillStyle = done ? '#2F6B2A' : INK;
    ctx.fillText(name, x + 34, ry);
    ctx.textAlign = 'right';
    ctx.fillText(b > 1 ? `${a}/${b}` : done ? 'OK' : '—', x + 202, ry);
    ctx.textAlign = 'left';
  });
  ctx.restore();
}

// na frente: as joaninhas voando
function drawLadybugs(ctx, eng) {
  (eng.ladybugs ?? []).forEach((b) => {
    const x = b.x - eng.camera;
    if (x < -40 || x > VIEW_W + 40) return;
    const dir = b.state === 'attack' && b.target && b.target !== 'boss' ? Math.sign(b.target.x - b.x) || 1 : Math.cos(b.a) < 0 ? 1 : -1;
    const fade = b.life < 60 && b.state !== 'leave' ? 0.5 + 0.5 * Math.sin(b.t) : 1;
    ctx.save();
    ctx.globalAlpha = fade;
    drawLadybug(ctx, x, b.y, 1, b.t / 60 + b.a, dir);
    ctx.restore();
  });
}

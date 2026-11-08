import { VIEW_W, VIEW_H, TILE, clamp } from './config';
import { spawnWaves, updateFoes, updateBoss, hitBox } from './flightFoes';
import { GROUND_Y, initGround, updateGround, keepPickupsClear } from './flightGround';
import { initSpray, updateSpray } from './flightSpray';

// Fase 6 · Aplicação Aérea (estilo shoot 'em up de avião): o Dão pilota o avião agrícola em voo rasante,
// a tela rola sozinha e ele atira jatos de algodão nas pragas, desviando de torres, postes e pivôs.
// No fim aparece o Barão Bicudo no dirigível.
const SCROLL = 2.6;
const POWER_FRAMES = 480;

export function initFlight(eng, def) {
  eng.flightMode = true;
  eng.fl = {
    dist: 0,
    speed: SCROLL,
    length: def.length * TILE,
    waves: (def.waves ?? []).map((w) => ({ ...w, done: false })),
    ground: initGround(def),
    plane: { x: 150, y: 220, w: 112, h: 38, vx: 0, vy: 0, invuln: 90, fireCd: 0, tilt: 0 },
    shots: [],
    foes: [],
    foeShots: [],
    booms: [],
    puffs: [],
    items: (def.bolls ?? []).map(([at, row]) => ({ at: at * TILE, y: row * TILE + 24, x: 0, live: false, taken: false })),
    goldens: (def.golden ?? []).map(([at, row]) => ({ at: at * TILE, y: row * TILE + 24, x: 0, live: false, taken: false, gold: true })),
    facts: (def.facts ?? []).map((f) => ({ ...f, at: f.x * TILE, y: f.y * TILE + 24, x: 0, live: false, taken: false })),
    boss: null,
    winT: 0,
    sp: initSpray(def),
  };
  keepPickupsClear(eng.fl.ground, [...eng.fl.items, ...eng.fl.goldens, ...eng.fl.facts, ...eng.fl.sp.pickups]);
}

function hurtPlane(eng, cause = '') {
  const pl = eng.fl.plane;
  if (pl.invuln > 0 || eng.power > 0 || eng.finished || eng.fl.boss?.dead) return;
  eng.lives -= 1;
  pl.invuln = 180;
  eng.shake = 14;
  eng.fl.booms.push({ x: pl.x + pl.w / 2, y: pl.y + pl.h / 2, t: 0, s: 0.7 });
  eng.lastHurt = cause;
  eng.hooks.onSound?.('hurt');
  emitFlightHud(eng);
  if (eng.lives <= 0) {
    eng.finished = true;
    eng.hooks.onGameOver?.({ score: eng.score, collected: eng.collected });
  }
}

function movePlane(eng) {
  const pl = eng.fl.plane;
  const inp = eng.input;
  const ax = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  const ay = (inp.down ? 1 : 0) - (inp.jump || inp.up ? 1 : 0);
  pl.vx = ax ? clamp(pl.vx + ax * 0.7, -5.5, 5.5) : pl.vx * 0.85;
  pl.vy = ay ? clamp(pl.vy + ay * 0.7, -5.5, 5.5) : pl.vy * 0.85;
  pl.x = clamp(pl.x + pl.vx, 20, VIEW_W - pl.w - 60);
  pl.y = clamp(pl.y + pl.vy, 40, GROUND_Y - pl.h - 6);
  pl.tilt += (pl.vy * 0.05 - pl.tilt) * 0.15;
  if (pl.invuln > 0) pl.invuln--;
  // jatos de algodão no botão (segurar = rajada; o capulho dourado dá tiro triplo)
  const firing = inp.throw || inp.punch || inp.throwTap || inp.punchTap;
  inp.throwTap = false;
  inp.punchTap = false;
  inp.jumpTap = false;
  if (pl.fireCd > 0) pl.fireCd--;
  else if (firing) {
    pl.fireCd = 9;
    const nx = pl.x + pl.w + 10;
    const ny = pl.y + pl.h / 2;
    eng.fl.shots.push({ x: nx, y: ny, vx: 11, vy: 0 });
    if (eng.power > 0) {
      eng.fl.shots.push({ x: nx, y: ny, vx: 10.5, vy: -2.4 }, { x: nx, y: ny, vx: 10.5, vy: 2.4 });
    }
    eng.shotSfx = ((eng.shotSfx ?? 0) + 1) % 2;
    if (eng.shotSfx === 0) eng.hooks.onSound?.('throw');
  }
  pl.puffT = ((pl.puffT ?? 0) + 1) % 3;
  if (pl.puffT === 0) eng.fl.puffs.push({ x: pl.x - 4, y: pl.y + pl.h * 0.55, t: 0 });
}

function updateShots(eng) {
  const fl = eng.fl;
  fl.shots.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
  });
  fl.shots = fl.shots.filter((s) => s.x < VIEW_W + 30 && s.y > -20 && s.y < VIEW_H && !s.hit);
  fl.foeShots.forEach((s) => {
    s.x += s.vx;
    s.y += s.vy;
    if (hitBox(s, { x: fl.plane.x + 18, y: fl.plane.y + 6, w: fl.plane.w - 36, h: fl.plane.h - 12 }, 4)) {
      s.hit = true;
      hurtPlane(eng, 'gosma');
    }
  });
  fl.foeShots = fl.foeShots.filter((s) => s.x > -30 && s.x < VIEW_W + 30 && s.y > -30 && s.y < VIEW_H && !s.hit);
  fl.puffs = fl.puffs.filter((p) => ++p.t < 30);
  fl.booms = fl.booms.filter((b) => ++b.t < 36);
}

// Capulhos, dourados e estrelas de curiosidade entram pela direita conforme o avião avança.
function updatePickups(eng) {
  const fl = eng.fl;
  const pl = fl.plane;
  const all = [...fl.items, ...fl.goldens, ...fl.facts];
  for (const it of all) {
    if (it.taken) continue;
    if (!it.live && fl.dist + VIEW_W + 40 >= it.at) {
      it.live = true;
      it.x = VIEW_W + 40;
    }
    if (!it.live) continue;
    it.x -= fl.speed;
    if (it.x < -40) it.taken = true;
    if (Math.abs(it.x - (pl.x + pl.w / 2)) < 70 && Math.abs(it.y - (pl.y + pl.h / 2)) < 50) {
      it.taken = true;
      if (it.title) {
        eng.factsFound++;
        eng.score += 25;
        eng.hooks.onSound?.('fact');
        eng.hold = true;
        // solta os botões: ao voltar da curiosidade o avião não sai disparando sozinho
        eng.input = { left: false, right: false, jump: false, punch: false, up: false, down: false, throw: false };
        eng.hooks.onFact?.(it);
      } else if (it.gold) {
        eng.power = POWER_FRAMES;
        eng.score += 50;
        eng.hooks.onSound?.('power');
      } else {
        eng.collected++;
        eng.score += 10;
        eng.hooks.onSound?.('boll');
      }
    }
  }
}

export function updateFlight(eng) {
  const fl = eng.fl;
  if (eng.power > 0) eng.power--;
  if (!fl.boss || !fl.boss.dead) movePlane(eng);
  if (fl.dist < fl.length) fl.dist += fl.speed;
  else fl.speed = Math.max(0.6, fl.speed - 0.02);
  // o cenário continua andando devagar na luta (fl.dist só serve para o fundo depois do fim)
  if (fl.dist >= fl.length) fl.dist += fl.speed;
  spawnWaves(eng);
  updateFoes(eng, hurtPlane);
  updateGround(eng, hurtPlane);
  updateBoss(eng, hurtPlane);
  updateShots(eng);
  updatePickups(eng);
  updateSpray(eng);
  // vitória: o chefão caiu, o avião dá a volta da vitória e a fase termina
  if (fl.boss?.dead && !eng.finished) {
    fl.winT++;
    const pl = fl.plane;
    pl.x += (VIEW_W * 0.42 - pl.x) * 0.03;
    pl.y += (270 + Math.sin(fl.winT * 0.06) * 30 - pl.y) * 0.05;
    pl.tilt = Math.sin(fl.winT * 0.06) * 0.12;
    if (fl.winT === 30) eng.hooks.onSound?.('win');
    if (fl.winT === 240) {
      eng.finished = true;
      emitFlightHud(eng);
      eng.hooks.onWin?.({ score: eng.score, collected: eng.collected, lives: eng.lives });
    }
  }
  eng.hudTick = (eng.hudTick + 1) % 6;
  if (eng.hudTick === 0) emitFlightHud(eng);
}

export function emitFlightHud(eng) {
  const fl = eng.fl;
  eng.hooks.onHud?.({
    score: eng.score,
    collected: eng.collected,
    lives: eng.lives,
    facts: eng.factsFound,
    keys: 0,
    need: 0,
    power: eng.power,
    progress: clamp(fl.dist / fl.length, 0, 1),
  });
}

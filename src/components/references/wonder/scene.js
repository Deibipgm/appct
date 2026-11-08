import { STAGE, BLOCKS, COIN_SPOTS, HERO_START, WEEVIL, FLY, GOAL } from './config';

const GRAVITY = 2500;
const MAX_SPEED = 310;
const ACCEL = 2600;
const JUMP = 900;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const overlap = (a, b) => a.x + a.w > b.x && a.x < b.x + b.w && a.y + a.h > b.y && a.y < b.y + b.h;
const rand = (a, b) => a + Math.random() * (b - a);

const PALETTE = {
  dust: ['#C08B52', '#E7BE84', '#9A6B3F'],
  fluff: ['#FFFDF7', '#EAF4FB', '#D8E9F3'],
  dirt: ['#8F6339', '#C08B52', '#FFD23F'],
};

function puff(s, x, y, n, kind = 'dust') {
  const colors = PALETTE[kind] ?? PALETTE.dust;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 + Math.random() * 0.7;
    const speed = rand(70, 190);
    s.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 70,
      g: kind === 'fluff' ? 210 : 700,
      r: rand(3, 6.5),
      color: colors[i % colors.length],
      life: rand(0.5, 0.95),
      max: 0.95,
    });
  }
}

export function createScene({ onCollect } = {}) {
  const boxes = [{ x: 0, y: STAGE.ground, w: STAGE.w, h: STAGE.h - STAGE.ground }, ...BLOCKS];

  const scene = {
    t: 0,
    count: 0,
    shake: 0,
    onCollect,
    input: { left: false, right: false, pointerX: null, jumpQueued: false },
    hero: { ...HERO_START, w: 50, h: 62, vx: 0, vy: 0, onGround: true, coyote: 0, face: 1, walk: 0, blink: 2.4, squash: 0 },
    coins: COIN_SPOTS.map(([x, y], i) => ({ x, y, phase: i * 0.72, takenAt: null, spawnAt: null })),
    weevil: { x: WEEVIL.minX, y: STAGE.ground - WEEVIL.h, w: WEEVIL.w, h: WEEVIL.h, vx: 78, alert: false, dead: 0, hurtT: 0, dustT: 0 },
    fly: { x: FLY.minX + 30, y: FLY.baseY, w: FLY.w, h: FLY.h, vx: 96, mode: 'hover', dead: 0, hurtT: 0 },
    particles: [],
    arrived: false,
    arrivedAt: 0,
  };

  scene.jump = () => {
    scene.input.jumpQueued = true;
  };
  scene.update = (dt) => update(scene, boxes, dt);
  return scene;
}

function update(s, boxes, dt) {
  s.t += dt;
  if (s.shake > 0) s.shake = Math.max(0, s.shake - dt * 30);
  updateHero(s, boxes, dt);
  updateGoal(s);
  updateWeevil(s, dt);
  updateFly(s, dt);
  updateCoins(s, dt);
  updateParticles(s, dt);
}

function updateHero(s, boxes, dt) {
  const h = s.hero;
  const inp = s.input;

  let dir = 0;
  if (inp.pointerX != null) {
    const dx = inp.pointerX - (h.x + h.w / 2);
    if (Math.abs(dx) > 18) dir = Math.sign(dx);
  } else {
    dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  }

  if (dir) {
    h.vx += dir * ACCEL * dt;
    h.face = dir;
  } else {
    h.vx *= Math.pow(0.0016, dt);
    if (Math.abs(h.vx) < 4) h.vx = 0;
  }
  h.vx = clamp(h.vx, -MAX_SPEED, MAX_SPEED);

  if (inp.jumpQueued) {
    inp.jumpQueued = false;
    if (h.onGround || h.coyote > 0) {
      h.vy = -JUMP;
      h.onGround = false;
      h.coyote = 0;
      h.squash = -0.22;
      puff(s, h.x + h.w / 2, h.y + h.h, 5, 'dust');
    }
  }
  h.coyote = h.onGround ? 0.1 : Math.max(0, h.coyote - dt);
  h.vy = Math.min(h.vy + GRAVITY * dt, 1500);

  h.x += h.vx * dt;
  for (const b of boxes) {
    if (!overlap(h, b)) continue;
    if (h.vx > 0) h.x = b.x - h.w;
    else if (h.vx < 0) h.x = b.x + b.w;
    h.vx = 0;
  }
  h.x = clamp(h.x, 8, STAGE.w - h.w - 8);

  const wasGround = h.onGround;
  const fallSpeed = h.vy;
  h.onGround = false;
  h.y += h.vy * dt;
  for (const b of boxes) {
    if (!overlap(h, b)) continue;
    if (h.vy > 0) {
      h.y = b.y - h.h;
      h.vy = 0;
      h.onGround = true;
    } else if (h.vy < 0) {
      h.y = b.y + b.h;
      h.vy = 40;
    }
  }

  if (h.onGround && !wasGround && fallSpeed > 220) {
    h.squash = 0.24;
    puff(s, h.x + h.w / 2, h.y + h.h, 6, 'dust');
  }

  h.squash += (0 - h.squash) * Math.min(1, dt * 10);
  if (h.onGround && Math.abs(h.vx) > 24) h.walk += Math.abs(h.vx) * dt * 0.1;
  h.blink -= dt;
  if (h.blink < 0) h.blink = rand(1.8, 4.6);
}

// Ao cruzar a linha de chegada, solta capulhos e devolve o herói ao início da cena.
function updateGoal(s) {
  const h = s.hero;

  if (!s.arrived) {
    if (h.x + h.w / 2 < GOAL.triggerX) return;
    s.arrived = true;
    s.arrivedAt = s.t;
    s.shake = 4;
    puff(s, GOAL.x - 14, STAGE.ground - 34, 10, 'fluff');
    return;
  }

  if (s.t - s.arrivedAt < 2.6) return;
  s.arrived = false;
  Object.assign(s.hero, { ...HERO_START, vx: 0, vy: 0, onGround: true, coyote: 0, face: 1, squash: 0 });
  puff(s, HERO_START.x + 25, STAGE.ground, 6, 'dust');
}

function updateWeevil(s, dt) {
  const e = s.weevil;
  if (e.dead > 0) {
    e.dead -= dt;
    if (e.dead <= 0) {
      e.x = WEEVIL.minX;
      e.vx = 78;
    }
    return;
  }

  const h = s.hero;
  e.alert = Math.abs(h.x + h.w / 2 - (e.x + e.w / 2)) < 220 && h.y + h.h > STAGE.ground - 110;
  const want = e.alert ? 210 : 84;
  const current = Math.abs(e.vx) || want;
  e.vx = Math.sign(e.vx || 1) * (current + (want - current) * Math.min(1, dt * 3.5));
  e.x += e.vx * dt;

  if (e.x < WEEVIL.minX) {
    e.x = WEEVIL.minX;
    e.vx = Math.abs(e.vx);
  }
  if (e.x + e.w > WEEVIL.maxX) {
    e.x = WEEVIL.maxX - e.w;
    e.vx = -Math.abs(e.vx);
  }

  e.dustT -= dt;
  if (e.alert && e.dustT <= 0) {
    e.dustT = 0.3;
    puff(s, e.x + e.w / 2, e.y + e.h, 1, 'dust');
  }
  e.hurtT = Math.max(0, e.hurtT - dt);
  collide(s, e, 'ground');
}

function updateFly(s, dt) {
  const e = s.fly;
  if (e.dead > 0) {
    e.dead -= dt;
    if (e.dead <= 0) {
      e.x = FLY.minX + 30;
      e.vx = 96;
    }
    return;
  }

  e.x += e.vx * dt;
  if (e.x < FLY.minX) {
    e.x = FLY.minX;
    e.vx = Math.abs(e.vx);
  }
  if (e.x + e.w > FLY.maxX) {
    e.x = FLY.maxX - e.w;
    e.vx = -Math.abs(e.vx);
  }

  const cycle = (s.t + 1.1) % 5.4;
  const dip = cycle > 3.3 && cycle < 4.7 ? Math.sin(((cycle - 3.3) / 1.4) * Math.PI) : 0;
  e.y = FLY.baseY + Math.sin(s.t * 1.7) * 14 + dip * 92;
  e.mode = dip > 0.25 ? 'dive' : 'hover';
  e.hurtT = Math.max(0, e.hurtT - dt);
  collide(s, e, 'air');
}

function collide(s, e, kind) {
  const h = s.hero;
  if (!overlap(h, e)) return;

  const stomp = h.vy > 120 && h.y + h.h - e.y < e.h * 0.75;
  if (stomp) {
    e.dead = 2.8;
    e.hurtT = 0;
    h.vy = -660;
    h.squash = -0.2;
    s.shake = 7;
    puff(s, e.x + e.w / 2, e.y + e.h / 2, 10, kind === 'ground' ? 'dirt' : 'fluff');
    return;
  }

  if (e.hurtT > 0) return;
  e.hurtT = 0.8;
  h.vx = (h.x + h.w / 2 < e.x + e.w / 2 ? -1 : 1) * 260;
  h.vy = Math.min(h.vy, -200);
  s.shake = 5;
  puff(s, h.x + h.w / 2, h.y + h.h / 2, 5, 'fluff');
}

function updateCoins(s, dt) {
  const h = s.hero;
  const hx = h.x + h.w / 2;
  const hy = h.y + h.h / 2;

  for (const c of s.coins) {
    if (c.takenAt != null) {
      if (s.t - c.takenAt > 4.4) {
        c.takenAt = null;
        c.spawnAt = s.t;
      }
      continue;
    }
    const cy = c.y + Math.sin(s.t * 2.1 + c.phase) * 7;
    if (Math.hypot(hx - c.x, hy - cy) < 34) {
      c.takenAt = s.t;
      s.count += 1;
      puff(s, c.x, cy, 9, 'fluff');
      s.onCollect?.(s.count);
    }
  }
}

function updateParticles(s, dt) {
  for (const p of s.particles) {
    p.life -= dt;
    p.vy += p.g * dt;
    p.vx *= Math.pow(0.14, dt);
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  s.particles = s.particles.filter((p) => p.life > 0);
}
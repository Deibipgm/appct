import { TILE, VIEW_W, STEP } from './config';
import { ART, getSprite, drawSprite } from './sprites';
import { INK, rr } from './brush';
import { emitCotton, emitDirt } from './fx';

// Chefões do jogo: um por fase, e derrotá-lo abre a porteira da saída.
//  Fase 1: Bicudão Gigante · Fase 2: Faísca · Fase 3: Relógio 24h.
// Ciclo de ataques: investida (com aviso), salto com onda de choque e disparos.
export const BOSSES = {
  bicudo: {
    name: 'BICUDÃO GIGANTE', art: 'weevil', hp: 4, w: 104, h: 118, draw: 1.3,
    order: ['charge', 'leap', 'spit'], spitN: [3, 5], wave: '#B07A50', spit: '#7A9A2E', float: 0,
  },
  faisca: {
    name: 'FAÍSCA', art: 'faisca', hp: 5, w: 96, h: 124, draw: 1.45,
    order: ['spit', 'leap', 'charge', 'spit'], spitN: [4, 6], wave: '#FF8A1F', spit: '#FF5A1A', float: 7,
  },
  traca: { name: 'TRAÇA RASGA-FIO', art: 'traca', hp: 6, w: 100, h: 112, draw: 1.55, order: ['spit', 'charge', 'leap', 'spit'], spitN: [3, 5], wave: '#B58BD6', spit: '#9B6BC4', float: 8 },
  // Fase bônus: nuvem de moscas-brancas que se divide a cada golpe (as joaninhas ajudam!)
  enxame: {
    name: 'ENXAME', art: 'whitefly', hp: 6, w: 110, h: 96, draw: 1, swarm: true,
    order: ['spit', 'charge', 'spit', 'leap'], spitN: [3, 5], wave: '#D8E48A', spit: '#F4F0C8', float: 10,
  },
  // Fase 5: Bicudão de coroa, escondido em um dos montes de restos da lavoura
  bicudao: {
    name: 'BICUDÃO', art: 'weevil', hp: 6, w: 104, h: 118, draw: 1.3, hidden: true, crown: true,
    order: ['charge', 'leap', 'spit', 'charge'], spitN: [3, 5], wave: '#B07A50', spit: '#7A9A2E', float: 0,
  },
  relogio: {
    name: 'RELÓGIO 24H', art: 'relogioChefe', hp: 6, w: 112, h: 118, draw: 1.3,
    order: ['leap', 'charge', 'spit', 'leap'], spitN: [3, 5], wave: '#F0273A', spit: '#FFD23F', float: 0, slows: true,
  },
};

export function createBoss(level) {
  const kind = BOSSES[level.boss] ? level.boss : 'bicudo';
  const cfg = BOSSES[kind];
  const W = cfg.w;
  const H = cfg.h;
  const ground = level.groundTop * TILE;
  const minX = (level.goalX - 16) * TILE;
  const maxX = (level.goalX - 4) * TILE;
  return {
    x: maxX - W, y: ground - H, w: W, h: H, vx: 0, vy: 0,
    ground, minX, maxX, triggerX: minX - 3 * TILE,
    kind, cfg, hp: cfg.hp, max: cfg.hp, hearts: 0, active: false, dead: false, deadT: 0, hidden: !!cfg.hidden,
    state: 'intro', timer: 70, dir: -1, hitT: 0, t: 0, next: 0,
    waves: [], spits: [],
  };
}

const enraged = (b) => b.hp <= b.max / 2;

function choose(b) {
  const order = b.cfg.order;
  b.state = `${order[b.next % order.length]}Prep`;
  b.next++;
  b.timer = enraged(b) ? 44 : 64;
}

function damage(eng, b, fromStomp) {
  if (b.hitT > 0) return false;
  b.hp--;
  b.hitT = 50;
  eng.shake = 10;
  eng.hitStop = 6;
  eng.score += 150;
  eng.pows.push({ x: b.x + b.w / 2, y: b.y + 20, t: 0 });
  emitCotton(eng, b.x + b.w / 2, b.y + b.h / 2, 12);
  eng.hooks.onSound?.('stomp');
  if (fromStomp) eng.player.vy = -13;
  // Coração de algodão (vida extra) cai do céu na metade e perto do fim da luta
  if (b.hp > 0 && (b.hp === Math.ceil(b.max / 2) || b.hp === 2)) {
    eng.bossHearts.push({ x: (b.minX + b.maxX) / 2 + (b.hearts % 2 ? 120 : -120), y: -30, ground: b.ground - 70, t: 0, taken: false });
    b.hearts++;
  }
  if (b.cfg.swarm) splitSwarm(eng, b);
  if (b.hp <= 0) {
    b.dead = true;
    // o enxame some de vez: as moscas que se soltaram também vão embora
    if (b.cfg.swarm) eng.enemies.forEach((e) => { if (e.swarmChild && !e.dead) { e.dead = true; e.deadT = 0; } });
    eng.gateOpen = true;
    eng.hooks.onSound?.('gate');
    eng.bossHearts.length = 0;
    eng.score += 1000;
    emitCotton(eng, b.x + b.w / 2, b.y + b.h / 2, 30);
    eng.hooks.onSound?.('win');
  } else {
    // atordoado por um instante depois do golpe
    b.state = 'stun';
    b.timer = 34;
    b.vx = 0;
  }
  eng.emitHud();
  return true;
}

// Enxame: a cada golpe, duas moscas-brancas se soltam da nuvem e voam pela arena.
function splitSwarm(eng, b) {
  const alive = eng.enemies.filter((e) => e.swarmChild && !e.dead).length;
  if (b.hp <= 0 || alive >= 4) return;
  for (let i = 0; i < 2; i++) {
    const x = b.x + b.w / 2 + (i ? 30 : -30);
    const y = b.ground - 170 - i * 30;
    eng.enemies.push({
      type: 'whitefly', x, y, baseY: y, w: 36, h: 28, vx: i ? 1.3 : -1.3,
      minX: b.minX, maxX: b.maxX, t: i, seed: eng.enemies.length, speed: 1.3,
      mode: 'hover', diveT: 0, alert: false, dead: false, deadT: 0, swarmChild: true,
    });
  }
}

// nuvem de moscas desenhada com a arte da mosca-branca; encolhe conforme perde vida
function drawSwarm(ctx, b, cx, cy, jitter) {
  const img = getSprite(ART.whitefly);
  const n = 5 + b.hp * 3;
  // sombra escura no meio (a "nuvem")
  const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, b.w * 0.75);
  g.addColorStop(0, 'rgba(70, 80, 30, 0.45)');
  g.addColorStop(1, 'rgba(70, 80, 30, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, b.w * 0.75, 0, Math.PI * 2);
  ctx.fill();
  const spin = b.state === 'charge' ? 3 : 1;
  for (let i = 0; i < n; i++) {
    const a = b.t * (1.6 + (i % 3) * 0.5) * spin + i * 2.39;
    const r = 18 + ((i * 37) % 44);
    const x = cx + jitter + Math.cos(a) * r * 1.2;
    const y = cy + Math.sin(a * 1.3) * r * 0.75;
    const dir = Math.cos(a) > 0 ? -1 : 1;
    if (img) drawSprite(ctx, img, x, y, 40 + (i % 3) * 6, { dir: dir * -b.dir, rot: Math.sin(b.t * 9 + i) * 0.2 });
  }
  // olhos bravos no centro da nuvem
  [-14, 14].forEach((dx) => {
    ctx.beginPath();
    ctx.ellipse(cx + jitter + dx, cy - 4, 9, 11, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDF7';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + jitter + dx + b.dir * 3, cy - 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();
  });
  ctx.beginPath();
  ctx.moveTo(cx + jitter - 24, cy - 18);
  ctx.lineTo(cx + jitter - 6, cy - 12);
  ctx.moveTo(cx + jitter + 24, cy - 18);
  ctx.lineTo(cx + jitter + 6, cy - 12);
  ctx.lineWidth = 4;
  ctx.stroke();
}

// coroa dourada do Bicudão
function drawCrown(ctx, x, y, t) {
  const w = 46;
  const h = 26;
  ctx.save();
  ctx.translate(x, y + Math.sin(t * 4) * 1.5);
  ctx.rotate(-0.12);
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2, -h);
  ctx.lineTo(-w / 4, -h * 0.5);
  ctx.lineTo(0, -h * 1.1);
  ctx.lineTo(w / 4, -h * 0.5);
  ctx.lineTo(w / 2, -h);
  ctx.lineTo(w / 2, 0);
  ctx.closePath();
  ctx.fillStyle = '#F2C230';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  [[-w / 4, -6, '#F0273A'], [0, -8, '#0072BC'], [w / 4, -6, '#F0273A']].forEach(([dx, dy, c]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  ctx.restore();
}

// bola de algodão arremessada pelo Dão
export function hitBossWith(eng, x, y, r) {
  const b = eng.boss;
  if (!b || b.dead || !b.active) return false;
  if (x + r < b.x || x - r > b.x + b.w || y + r < b.y || y - r > b.y + b.h) return false;
  damage(eng, b, false);
  return true;
}

// Dano do chefão; o Relógio 24h ainda deixa o Dão lento por um tempo.
function bossHit(eng, b) {
  const before = eng.lives;
  eng.hurt();
  if (b.cfg.slows && eng.lives < before) eng.player.slow = Math.max(eng.player.slow ?? 0, 150);
}

// Coração de algodão: cai do céu, flutua e dá uma vida ao ser pego.
export function updateBossHearts(eng) {
  const p = eng.player;
  eng.bossHearts = eng.bossHearts.filter((h) => {
    h.t++;
    if (h.y < h.ground) h.y = Math.min(h.ground, h.y + 4);
    const bob = h.y >= h.ground ? Math.sin(h.t / 12) * 5 : 0;
    const hit = Math.abs(p.x + p.w / 2 - h.x) < 30 && Math.abs(p.y + p.h / 2 - (h.y + bob)) < 38;
    if (!hit) return true;
    if (eng.lives < 5) eng.lives++;
    eng.score += 100;
    emitCotton(eng, h.x, h.y, 16);
    eng.hooks.onSound?.('power');
    eng.emitHud();
    return false;
  });
}

export function drawBossHearts(ctx, eng) {
  eng.bossHearts.forEach((h) => {
    const x = h.x - eng.camera;
    if (x < -40 || x > VIEW_W + 40) return;
    const bob = h.y >= h.ground ? Math.sin(h.t / 12) * 5 : 0;
    const y = h.y + bob;
    const pulse = 1 + Math.sin(h.t / 7) * 0.06;
    // brilho
    const g = ctx.createRadialGradient(x, y, 4, x, y, 40);
    g.addColorStop(0, 'rgba(255, 190, 200, 0.85)');
    g.addColorStop(1, 'rgba(255, 190, 200, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    // coração feito de chumaços de algodão
    const lobes = [[-9, -6, 11], [9, -6, 11], [-13, 4, 9], [13, 4, 9], [-6, 12, 9], [6, 12, 9], [0, 18, 7], [0, 2, 12]];
    ctx.fillStyle = INK;
    lobes.forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(dx, dy - 4, r + 2.4, 0, Math.PI * 2); ctx.fill(); });
    lobes.forEach(([dx, dy, r]) => {
      const gr = ctx.createRadialGradient(dx - 3, dy - 8, 1, dx, dy - 4, r);
      gr.addColorStop(0, '#FFFFFF');
      gr.addColorStop(1, '#FFD9DF');
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(dx, dy - 4, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#F25C75';
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-12, 4, -12, -8, 0, -2);
    ctx.bezierCurveTo(12, -8, 12, 4, 0, 12);
    ctx.fill();
    ctx.restore();
    ctx.font = '800 12px "Baloo 2", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = INK;
    ctx.strokeText('+1 VIDA', x, y - 34);
    ctx.fillStyle = '#FFFDF7';
    ctx.fillText('+1 VIDA', x, y - 34);
    ctx.textAlign = 'left';
  });
}

export function updateBoss(eng) {
  const b = eng.boss;
  if (!b) return;
  if (b.dead) { b.deadT++; return; }
  const p = eng.player;
  if (!b.active) {
    if (b.hidden) return; // escondido: só aparece quando o Dão acha o monte certo (manejo.js)
    if (p.x > b.triggerX) { b.active = true; eng.shake = 14; eng.hooks.onSound?.('hurt'); }
    return;
  }
  b.t += STEP;
  if (b.hitT > 0) b.hitT--;
  b.timer--;
  const speed = enraged(b) ? 1.35 : 1;

  if (b.state === 'intro' || b.state === 'stun' || b.state === 'rest') {
    b.dir = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
    if (b.timer <= 0) choose(b);
  } else if (b.state === 'chargePrep') {
    b.dir = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
    if (b.timer <= 0) { b.state = 'charge'; b.vx = b.dir * 7.5 * speed; }
  } else if (b.state === 'charge') {
    b.x += b.vx;
    if (b.x <= b.minX || b.x + b.w >= b.maxX) {
      b.x = Math.max(b.minX, Math.min(b.maxX - b.w, b.x));
      eng.shake = 12;
      emitDirt(eng, b.x + (b.vx > 0 ? b.w : 0), b.ground - 10, 10);
      b.state = 'rest';
      b.timer = enraged(b) ? 40 : 64; // bate na parede e fica tonto: hora de atacar
    }
  } else if (b.state === 'leapPrep') {
    if (b.timer <= 0) {
      b.state = 'leap';
      const target = Math.max(b.minX, Math.min(b.maxX - b.w, p.x - b.w / 2));
      b.vy = -17;
      b.vx = (target - b.x) / 50;
    }
  } else if (b.state === 'leap') {
    b.vy += 0.68;
    b.x = Math.max(b.minX, Math.min(b.maxX - b.w, b.x + b.vx));
    b.y += b.vy;
    if (b.y >= b.ground - b.h) {
      b.y = b.ground - b.h;
      b.vy = 0;
      eng.shake = 16;
      emitDirt(eng, b.x + b.w / 2, b.ground, 14);
      // ondas de choque correm pelo chão: o jogador precisa pular
      const ws = 5.5 * speed;
      b.waves.push({ x: b.x, vx: -ws }, { x: b.x + b.w, vx: ws });
      b.state = 'rest';
      b.timer = enraged(b) ? 46 : 70;
    }
  } else if (b.state === 'spitPrep') {
    b.dir = p.x + p.w / 2 < b.x + b.w / 2 ? -1 : 1;
    if (b.timer <= 0) {
      const n = b.cfg.spitN[enraged(b) ? 1 : 0];
      const mx = b.x + b.w / 2 + b.dir * 40;
      for (let i = 0; i < n; i++) {
        b.spits.push({ x: mx, y: b.y + 26, vx: b.dir * (2.2 + i * 1.6), vy: -9 - (i % 2) * 2.5 });
      }
      b.state = 'rest';
      b.timer = enraged(b) ? 52 : 76;
    }
  }

  // ondas de choque
  b.waves = b.waves.filter((w) => {
    w.x += w.vx;
    if (w.x < b.minX - 40 || w.x > b.maxX + 40) return false;
    const hit = p.y + p.h > b.ground - 22 && p.x + p.w > w.x - 12 && p.x < w.x + 12;
    if (hit) bossHit(eng, b);
    return !hit;
  });
  // gotas de chorume
  b.spits = b.spits.filter((s) => {
    s.vy += 0.42;
    s.x += s.vx;
    s.y += s.vy;
    if (s.y > b.ground) { emitDirt(eng, s.x, b.ground, 3); return false; }
    const hit = p.x + p.w > s.x - 9 && p.x < s.x + 9 && p.y + p.h > s.y - 9 && p.y < s.y + 9;
    if (hit) bossHit(eng, b);
    return !hit;
  });

  // soco do Dão
  if (p.punchT > 4 && p.punchT < 17) {
    const x1 = p.face > 0 ? p.x + p.w - 6 : p.x - 50;
    const x2 = p.face > 0 ? p.x + p.w + 50 : p.x + 6;
    if (b.x + b.w > x1 && b.x < x2 && b.y + b.h > p.y - 10 && b.y < p.y + p.h) {
      if (damage(eng, b, false)) {
        b.x = Math.max(b.minX, Math.min(b.maxX - b.w, b.x + p.face * 30));
      }
      return;
    }
  }
  // contato: pisão na cabeça machuca; encostar no corpo dói no Dão
  const overlap = p.x + p.w > b.x + 10 && p.x < b.x + b.w - 10 && p.y + p.h > b.y + 6 && p.y < b.y + b.h;
  if (!overlap) return;
  if (p.vy > 1 && p.y + p.h - b.y < 34) damage(eng, b, true);
  else if (eng.power > 0) damage(eng, b, false);
  else if (b.hitT === 0) bossHit(eng, b);
}

export function drawBoss(ctx, eng) {
  const b = eng.boss;
  if (!b || (b.dead && b.deadT > 40) || b.hidden) return;
  const cam = eng.camera;
  const cx = b.x + b.w / 2 - cam;
  if (cx < -200 || cx > VIEW_W + 200) return;

  // ondas e gotas
  b.waves.forEach((w) => {
    const wx = w.x - cam;
    ctx.beginPath();
    ctx.moveTo(wx - 14, b.ground);
    ctx.quadraticCurveTo(wx, b.ground - 38, wx + 14, b.ground);
    ctx.fillStyle = b.cfg.wave;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });
  b.spits.forEach((s) => {
    ctx.beginPath();
    ctx.arc(s.x - cam, s.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = b.cfg.spit;
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });

  ctx.save();
  if (b.dead) ctx.globalAlpha = Math.max(0, 1 - b.deadT / 40);
  if (b.hitT > 0 && Math.floor(b.hitT / 4) % 2 === 0) ctx.globalAlpha *= 0.4;
  // aviso antes do ataque: tremida e brilho vermelho
  const prep = b.state.endsWith('Prep');
  const jitter = prep ? Math.sin(b.t * 60) * 3 : 0;
  ctx.fillStyle = 'rgba(27,18,12,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx, b.ground + 2, b.w * 0.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  const art = getSprite(ART[b.cfg.art]);
  const fl = b.cfg.float ? Math.sin(b.t * 3) * b.cfg.float - b.cfg.float : 0;
  const step = b.state === 'charge' ? Math.abs(Math.sin(b.t * 18)) : 0;
  if (b.cfg.swarm) {
    drawSwarm(ctx, b, cx, b.y + b.h / 2 + fl, jitter);
  } else if (art) {
    drawSprite(ctx, art, cx + jitter, b.y + b.h + 4 + fl, b.w * b.cfg.draw, {
      dir: b.dir,
      rot: (b.state === 'charge' ? 0.15 : b.state === 'stun' ? -0.1 : 0) * b.dir,
      sy: b.state === 'leapPrep' ? 0.88 : 1 - step * 0.05,
      anchorY: 0.97,
    });
  }
  if (b.cfg.crown) drawCrown(ctx, cx + jitter + b.dir * 6, b.y - 8 + fl, b.t);
  if (prep) {
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 5;
    ctx.strokeStyle = INK;
    ctx.strokeText('!', cx, b.y - 18);
    ctx.fillStyle = '#F0273A';
    ctx.fillText('!', cx, b.y - 18);
  }
  if (b.state === 'stun' || b.state === 'rest') {
    ctx.fillStyle = '#FFD23F';
    for (let i = 0; i < 3; i++) {
      const a = b.t * 5 + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 26, b.y - 6 + Math.sin(a) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
  ctx.textAlign = 'left';

  // barra de vida no topo da tela
  if (!b.active || b.dead) return;
  const bw = 260;
  const bx = VIEW_W / 2 - bw / 2;
  ctx.beginPath();
  rr(ctx, bx, 16, bw, 18, 9);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.beginPath();
  rr(ctx, bx + 3, 19, (bw - 6) * (b.hp / b.max), 12, 6);
  ctx.fillStyle = enraged(b) ? '#F0273A' : '#F28C28';
  ctx.fill();
  ctx.beginPath();
  rr(ctx, bx, 16, bw, 18, 9);
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.font = '800 13px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.fillText(b.cfg.name, VIEW_W / 2, 50);
  ctx.textAlign = 'left';
}
import {
  TILE,
  VIEW_W,
  VIEW_H,
  ROWS,
  GRAVITY,
  MAX_FALL,
  MOVE_SPEED,
  JUMP_VY,
  PLAYER_W,
  PLAYER_H,
  STEP,
  clamp,
} from './config';
import { initWonder, updateWonder, beltPush } from './wonder';
import { buildLevel } from './levels';
import { initRopes, ropeHang, updateRopes } from './ropes';
import { initVents, updateVents } from './vents';
import { initTutorial, updateTutorial } from './tutorial';
import { initManejo, updateManejo } from './manejo';
import { createBoss, updateBoss, updateBossHearts } from './boss';
import { updateDance } from './finale';
import { updateThrows } from './throws';
import { updateClockPower, updateClockWaves, SLOW_FACTOR } from './clockFoe';
import { updateCochonilha, updateAcid } from './acidFoe';
import { drawScene } from './render';
import { initFlight, updateFlight, emitFlightHud } from './flight';
import { drawFlight } from './flightDraw';
import { emitCotton, emitDew, emitDirt, emitLeaves, emitMote } from './fx';

// Duração do poder do capulho dourado (8 segundos a 60 quadros por segundo).
const POWER_FRAMES = 480;
// Impulso do capulho-mola: quase o dobro da altura do pulo normal (mais ainda segurando o pulo).
const SPRING_VY = -20.5;
// Duração do soco (quadros) e alcance do punho à frente do Dão (pixels).
const PUNCH_FRAMES = 20;
const PUNCH_REACH = 50;
const SPRING_VY_HELD = -23;

export class GameEngine {
  constructor(def, hooks = {}) {
    this.hooks = hooks;
    // Fase 6 (Aplicação Aérea): motor de voo próprio, sem herói a pé nem grade de blocos
    if (def.flight) {
      this.input = { left: false, right: false, jump: false, punch: false };
      this.score = 0;
      this.collected = 0;
      this.lives = hooks.lives ?? 5;
      this.time = 0;
      this.finished = false;
      this.paused = false;
      this.hold = false;
      this.shake = 0;
      this.hudTick = 0;
      this.power = 0;
      this.factsFound = 0;
      this.level = def;
      initFlight(this, def);
      emitFlightHud(this);
      return;
    }
    this.level = buildLevel(def);
    this.input = { left: false, right: false, jump: false, punch: false };
    this.prevPunch = false;
    this.pows = [];
    this.score = 0;
    this.collected = 0;
    this.lives = hooks.lives ?? 5;
    this.time = 0;
    this.camera = 0;
    this.finished = false;
    this.paused = false;
    this.particles = [];
    this.ambient = 0;
    this.shake = 0;
    this.hudTick = 0;
    this.prevJump = false;
    this.bolls = this.level.bolls;
    this.goldens = this.level.golden ?? [];
    this.keys = this.level.keys ?? [];
    this.keysFound = 0;
    this.gateOpen = this.keys.length === 0;
    this.power = 0;
    this.bonuses = [];
    this.enemies = this.level.enemies;
    this.boss = createBoss(this.level);
    this.bossHearts = [];
    if (this.boss) this.gateOpen = false;
    this.springs = this.level.springs ?? [];
    initWonder(this);
    initRopes(this);
    initVents(this);
    initTutorial(this);
    initManejo(this);
    this.curiosities = this.level.curiosities ?? [];
    this.factsFound = 0;
    this.hold = false;
    this.checkpoint = { x: this.level.startX * TILE, y: this.level.groundTop * TILE - PLAYER_H };
    this.resetPlayer(true);
    this.camera = 0;
    this.emitHud();
  }

  respawn() {
    const c = this.checkpoint;
    this.player = {
      x: c.x,
      y: c.y,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: true,
      face: 1,
      coyote: 0,
      buffer: 0,
      anim: 0,
      invuln: 100,
      hurtFx: false,
    };
    this.camera = clamp(c.x - VIEW_W * 0.42, 0, this.level.width * TILE - VIEW_W);
  }

  resetPlayer(hard = false) {
    this.player = {
      x: this.level.startX * TILE,
      y: this.level.groundTop * TILE - PLAYER_H,
      w: PLAYER_W,
      h: PLAYER_H,
      vx: 0,
      vy: 0,
      onGround: false,
      face: 1,
      coyote: 0,
      buffer: 0,
      anim: 0,
      invuln: hard ? 100 : 90,
      hurtFx: false,
    };
    if (!hard) this.camera = clamp(this.player.x - VIEW_W * 0.42, 0, this.level.width * TILE - VIEW_W);
  }

  solidAt(tx, ty) {
    if (tx < 0 || tx >= this.level.width) return true;
    if (ty < 0 || ty >= ROWS) return false;
    const v = this.level.grid[ty][tx];
    // plataformas (pontes de fio) só seguram por cima: dá para passar por baixo e pelos lados
    return v !== 0 && v !== 2;
  }

  emitHud() {
    if (this.flightMode) {
      emitFlightHud(this);
      return;
    }
    const goalPx = this.level.goalX * TILE;
    this.hooks.onHud?.({
      score: this.score,
      collected: this.collected,
      lives: this.lives,
      facts: this.factsFound,
      keys: this.keysFound,
      need: this.keys.length,
      power: this.power,
      progress: clamp(this.player.x / goalPx, 0, 1),
    });
  }

  step() {
    if (this.flightMode) {
      this.time += STEP;
      if (this.shake > 0.2) this.shake *= 0.9;
      else this.shake = 0;
      if (this.finished || this.paused || this.hold) return;
      updateFlight(this);
      return;
    }
    this.time += STEP;
    if (this.shake > 0.2) this.shake *= 0.9;
    else this.shake = 0;
    if (this.power > 0) this.power--;
    this.updateParticles();
    this.pows = this.pows.filter((w) => ++w.t < 22);
    this.ambient = (this.ambient + 1) % 96;
    if (this.ambient === 0) emitMote(this);
    if (this.finale && !this.paused) updateDance(this);
    if (this.finished || this.paused || this.hold) return;
    // pausa de impacto: o jogo congela 2 a 4 quadros quando um golpe acerta
    if (this.hitStop > 0) { this.hitStop--; return; }

    this.updatePlayer();
    updateRopes(this);
    updateVents(this);
    updateTutorial(this);
    updateThrows(this);
    this.updateSprings();
    this.updateEnemies();
    updateManejo(this);
    updateClockWaves(this);
    updateAcid(this);
    updateBoss(this);
    updateBossHearts(this);
    updateWonder(this);
    this.updateBolls();
    this.updateGoldens();
    this.updateKeys();
    this.updateBonuses();
    this.updateCuriosities();
    this.updateCamera();
    this.checkGoal();

    this.hudTick = (this.hudTick + 1) % 6;
    if (this.hudTick === 0) this.emitHud();
  }

  updatePlayer() {
    const p = this.player;
    if (p.invuln > 0) p.invuln--;

    // Soco: avança o punho para a frente e derruba as pragas ao alcance.
    if (p.punchT > 0) p.punchT--;
    if (p.punchCd > 0) p.punchCd--;
    // toques rápidos no celular ficam guardados até o próximo quadro
    const punchTap = this.input.punchTap;
    this.input.punchTap = false;
    if ((punchTap || (this.input.punch && !this.prevPunch)) && !(p.punchCd > 0)) {
      p.punchT = PUNCH_FRAMES;
      p.punchCd = PUNCH_FRAMES + 6;
      this.hooks.onSound?.('punch');
    }
    this.prevPunch = this.input.punch;
    if (ropeHang(this)) return;

    // poder do Relógio 24h: o Dão fica mais lento por um tempo
    const slow = p.slow > 0 ? SLOW_FACTOR : 1;
    const speed = MOVE_SPEED * slow;
    const dir = (this.input.right ? 1 : 0) - (this.input.left ? 1 : 0);
    if (dir !== 0) {
      p.vx += dir * 0.9 * slow;
      p.face = dir;
    } else {
      p.vx *= 0.72;
      if (Math.abs(p.vx) < 0.06) p.vx = 0;
    }
    p.vx = clamp(p.vx, -speed, speed);
    p.vx += beltPush(this);

    const jumpTap = this.input.jumpTap;
    this.input.jumpTap = false;
    if (jumpTap || (this.input.jump && !this.prevJump)) p.buffer = 9;
    else p.buffer = Math.max(0, p.buffer - 1);
    this.prevJump = this.input.jump;

    if (p.onGround) p.coyote = 9;
    else p.coyote = Math.max(0, p.coyote - 1);

    if (p.buffer > 0 && p.coyote > 0) {
      p.vy = JUMP_VY;
      p.buffer = 0;
      p.coyote = 0;
      p.onGround = false;
      emitDirt(this, p.x + p.w / 2, p.y + p.h, 5);
      this.hooks.onSound?.('jump');
    }
    if (p.boost && p.vy >= 0) p.boost = false;
    if (!this.input.jump && !p.boost && p.vy < -5.5) p.vy = -5.5;
    // vapor da carda: planar devagar enquanto dura o impulso
    if (p.flyT > 0) {
      p.flyT--;
      if (p.onGround && !p.flyGrace) p.flyT = 0;
    }
    const glide = p.flyT > 0 && p.vy > -2;
    p.vy = Math.min(p.vy + GRAVITY * (glide ? 0.3 : 1), glide ? 3.2 : MAX_FALL);

    // horizontal
    p.x += p.vx;
    const topRow = Math.floor(p.y / TILE);
    const bottomRow = Math.floor((p.y + p.h - 1) / TILE);
    if (p.vx > 0) {
      const tx = Math.floor((p.x + p.w - 1) / TILE);
      for (let ty = topRow; ty <= bottomRow; ty++) {
        if (this.solidAt(tx, ty)) {
          p.x = tx * TILE - p.w;
          p.vx = 0;
          break;
        }
      }
    } else if (p.vx < 0) {
      const tx = Math.floor(p.x / TILE);
      for (let ty = topRow; ty <= bottomRow; ty++) {
        if (this.solidAt(tx, ty)) {
          p.x = (tx + 1) * TILE;
          p.vx = 0;
          break;
        }
      }
    }

    // vertical
    const wasGround = p.onGround;
    const fallSpeed = p.vy;
    p.onGround = false;
    const prevBottom = p.y + p.h;
    p.y += p.vy;
    const leftCol = Math.floor(p.x / TILE);
    const rightCol = Math.floor((p.x + p.w - 1) / TILE);
    if (p.vy > 0) {
      const ty = Math.floor((p.y + p.h - 1) / TILE);
      for (let tx = leftCol; tx <= rightCol; tx++) {
        const oneWay = this.level.grid[ty]?.[tx] === 2 && prevBottom <= ty * TILE + 6;
        if (this.solidAt(tx, ty) || oneWay) {
          p.y = ty * TILE - p.h;
          p.vy = 0;
          p.onGround = true;
          break;
        }
      }
    } else if (p.vy < 0) {
      const ty = Math.floor(p.y / TILE);
      for (let tx = leftCol; tx <= rightCol; tx++) {
        if (this.solidAt(tx, ty)) {
          this.hitBlock(tx, ty);
          p.y = (ty + 1) * TILE;
          p.vy = 0;
          break;
        }
      }
    }

    if (p.onGround && !wasGround && fallSpeed > 5) {
      emitDirt(this, p.x + p.w / 2, p.y + p.h, 5);
      emitDew(this, p.x + p.w / 2, p.y + p.h, 3);
    }

    p.x = clamp(p.x, 0, this.level.width * TILE - p.w);
    // porteira fechada: barra a passagem até reunir os três itens da fase
    if (!this.gateOpen && p.x + p.w > this.gateX()) {
      p.x = this.gateX() - p.w;
      p.vx = 0;
    }
    if (p.onGround) {
      p.anim += Math.abs(p.vx) * 0.115;
      if (p.x > this.checkpoint.x + 14 * TILE) {
        this.checkpoint = { x: p.x - 60, y: p.y };
        this.flagT = 0;
      }
    }

    if (p.y > VIEW_H + 140) this.hurt(true);
  }

  updateEnemies() {
    const p = this.player;
    for (const e of this.enemies) {
      if (e.dead) {
        e.deadT++;
        continue;
      }
      e.t += STEP;
      if (e.type === 'whitefly') this.moveWhitefly(e, p);
      else if (e.skin === 'cochonilha') {
        if (!updateCochonilha(this, e)) this.moveWeevil(e, p);
      }
      else if (this.level.id === 'laboratorio') {
        this.moveBicudao(e, p);
        if (e.skin === 'relogio') updateClockPower(this, e);
      }
      else this.moveWeevil(e, p);
      if (this.punchHits(e)) continue;

      const overlap =
        p.x + p.w > e.x + 4 && p.x < e.x + e.w - 4 && p.y + p.h > e.y + 3 && p.y < e.y + e.h - 2;
      if (!overlap) continue;

      const stomp = p.vy > 1.2 && p.y + p.h - e.y < 26;
      if (stomp || this.power > 0) {
        e.dead = true;
        e.deadT = 0;
        if (stomp) p.vy = -11.5;
        this.hitStop = 3;
        this.shake = Math.max(this.shake, 4);
        this.pows.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, t: 0 });
        this.score += 50;
        if (e.type === 'whitefly') {
          emitCotton(this, e.x + e.w / 2, e.y + e.h / 2, 6);
          emitLeaves(this, e.x + e.w / 2, e.y + e.h / 2, 3);
        } else {
          emitDirt(this, e.x + e.w / 2, e.y + e.h / 2, 7);
          emitLeaves(this, e.x + e.w / 2, e.y + e.h / 2, 3);
        }
        this.hooks.onSound?.('stomp');
        this.emitHud();
      } else if (!e.lured) {
        // bicudo atraído pelo feromônio só pensa na armadilha: não ataca o Dão
        this.hurt();
      }
    }
  }

  // O punho só acerta na parte do meio do soco (quando o braço está esticado).
  punchHits(e) {
    const p = this.player;
    if (e.dead || !(p.punchT > 4 && p.punchT < PUNCH_FRAMES - 3)) return false;
    const x1 = p.face > 0 ? p.x + p.w - 6 : p.x - PUNCH_REACH;
    const x2 = p.face > 0 ? p.x + p.w + PUNCH_REACH : p.x + 6;
    const hit = e.x + e.w > x1 && e.x < x2 && e.y + e.h > p.y - 10 && e.y < p.y + p.h;
    if (!hit) return false;
    e.dead = true;
    e.deadT = 0;
    e.vx = p.face * Math.abs(e.vx || 1);
    this.score += 60;
    this.shake = 6;
    this.hitStop = 4;
    this.pows.push({ x: e.x + e.w / 2, y: e.y + e.h / 2, t: 0 });
    emitCotton(this, e.x + e.w / 2, e.y + e.h / 2, 8);
    emitLeaves(this, e.x + e.w / 2, e.y + e.h / 2, 3);
    this.hooks.onSound?.('stomp');
    this.emitHud();
    return true;
  }

  // Bicudo: patrulha o solo e acelera quando o jogador chega perto no mesmo nível.
  moveWeevil(e, p) {
    const sameLevel = Math.abs(p.y + p.h - (e.y + e.h)) < 52;
    const near = Math.abs(p.x - e.x) < 190;
    e.alert = near && sameLevel;
    const want = e.alert ? 2.3 : (e.speed ?? 1.15) * 0.85;
    const speed = Math.abs(e.vx) + (want - Math.abs(e.vx)) * 0.06;
    e.vx = (e.vx >= 0 ? 1 : -1) * speed;
    e.x += e.vx;
    if (e.x < e.minX) {
      e.x = e.minX;
      e.vx = Math.abs(e.vx);
    }
    if (e.x + e.w > e.maxX) {
      e.x = e.maxX - e.w;
      e.vx = -Math.abs(e.vx);
    }
    if (e.alert && Math.random() < 0.1) emitDirt(this, e.x + e.w / 2, e.y + e.h, 1);
  }

  // Bicudão do laboratório: patrulha, prepara o bote ao ver o Dão, investe em disparada
  // e dá saltos na direção dele. Depois de cada ataque descansa um pouco.
  moveBicudao(e, p) {
    e.state = e.state ?? 'patrol';
    e.timer = (e.timer ?? 0) + 1;
    e.vy = e.vy ?? 0;
    const dx = p.x + p.w / 2 - (e.x + e.w / 2);
    const seen = Math.abs(dx) < 260 && Math.abs(p.y + p.h - (e.y + e.h)) < 140;
    const go = (s) => {
      e.state = s;
      e.timer = 0;
    };

    if (e.state === 'patrol') {
      e.vx = Math.sign(e.vx || 1) * 1.3;
      if (seen) {
        e.vx = Math.sign(dx || 1) * 0.01;
        go('windup');
      }
    } else if (e.state === 'windup') {
      e.vx = Math.sign(e.vx) * 0.01;
      if (e.timer % 6 === 0) emitDirt(this, e.x + e.w / 2, e.y + e.h, 1);
      if (e.timer > 26) {
        const hop = Math.abs(dx) > 120 && Math.random() < 0.5;
        e.vx = Math.sign(dx || 1) * (hop ? 3.4 : 4.6);
        if (hop) e.vy = -9.5;
        go(hop ? 'hop' : 'charge');
      }
    } else if (e.state === 'charge') {
      if (Math.random() < 0.3) emitDirt(this, e.x + e.w / 2, e.y + e.h, 1);
      if (e.timer > 55) go('rest');
    } else if (e.state === 'hop') {
      e.vy += GRAVITY;
      e.y += e.vy;
      if (e.y >= e.baseY) {
        e.y = e.baseY;
        e.vy = 0;
        this.shake = Math.max(this.shake, 4);
        emitDirt(this, e.x + e.w / 2, e.y + e.h, 6);
        go('rest');
      }
    } else if (e.state === 'rest') {
      e.vx = Math.sign(e.vx) * 0.6;
      if (e.timer > 45) go('patrol');
    }

    e.alert = e.state === 'windup' || e.state === 'charge' || e.state === 'hop';
    e.x += e.vx;
    const minX = e.minX - TILE;
    const maxX = e.maxX + TILE;
    if (e.x < minX) {
      e.x = minX;
      e.vx = Math.abs(e.vx);
    }
    if (e.x + e.w > maxX) {
      e.x = maxX - e.w;
      e.vx = -Math.abs(e.vx);
    }
  }

  // Mosca-branca: voa em vaivém e mergulha na direção do jogador quando ele se aproxima.
  moveWhitefly(e, p) {
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const dx = p.x + p.w / 2 - cx;
    const dy = p.y + p.h / 2 - cy;
    const dist = Math.hypot(dx, dy);

    if (e.mode !== 'dive' && dist < 215 && dist > 1) {
      e.mode = 'dive';
      e.diveT = 0;
    }

    if (e.mode === 'dive') {
      e.diveT += 1;
      e.x += Math.sign(dx || 1) * 2.3;
      e.y += Math.sign(dy || 1) * 1.9;
      e.y = clamp(e.y, 44, this.level.groundTop * TILE - e.h - 6);
      if (e.diveT > 78) e.mode = 'hover';
    } else {
      e.x += e.vx;
      if (e.x < e.minX) {
        e.x = e.minX;
        e.vx = Math.abs(e.vx);
      }
      if (e.x + e.w > e.maxX) {
        e.x = e.maxX - e.w;
        e.vx = -Math.abs(e.vx);
      }
      const targetY = e.baseY + Math.sin(e.t * 2.4 + e.seed) * 14;
      e.y += (targetY - e.y) * 0.1;
    }

    e.x = clamp(e.x, 8, this.level.width * TILE - e.w - 8);
  }

  // Capulho-mola: ao cair em cima dele, o Dão é lançado bem alto.
  updateSprings() {
    const p = this.player;
    for (const sp of this.springs) {
      if (sp.squash > 0) sp.squash = Math.max(0, sp.squash - 0.06);
      const feet = p.y + p.h;
      const top = sp.y - sp.h;
      const over = Math.abs(p.x + p.w / 2 - sp.x) < 24;
      if (over && p.vy > 0 && feet >= top - 2 && feet <= top + 20) {
        p.y = top - p.h;
        p.vy = this.input.jump ? SPRING_VY_HELD : SPRING_VY;
        p.boost = true;
        p.onGround = false;
        p.coyote = 0;
        sp.squash = 1;
        this.score += 5;
        emitCotton(this, sp.x, top, 10);
        this.hooks.onSound?.('spring');
      }
    }
  }

  updateBolls() {
    const p = this.player;
    for (const b of this.bolls) {
      if (b.taken) continue;
      if (Math.abs(p.x + p.w / 2 - b.x) < 28 && Math.abs(p.y + p.h / 2 - b.y) < 30) {
        b.taken = true;
        this.collected++;
        this.score += 10;
        emitCotton(this, b.x, b.y, 8);
        this.hooks.onSound?.('boll');
        this.emitHud();
      }
    }
  }

  // Capulho dourado: ativa o poder por alguns segundos.
  updateGoldens() {
    const p = this.player;
    for (const g of this.goldens) {
      if (g.taken) continue;
      if (Math.abs(p.x + p.w / 2 - g.x) < 30 && Math.abs(p.y + p.h / 2 - g.y) < 32) {
        g.taken = true;
        this.power = POWER_FRAMES;
        this.score += 50;
        emitCotton(this, g.x, g.y, 12);
        this.hooks.onSound?.('power');
        this.emitHud();
      }
    }
  }

  // Itens especiais da fase: reunidos os três, a porteira da usina se abre.
  updateKeys() {
    if (this.gateOpen) return;
    const p = this.player;
    for (const k of this.keys) {
      if (k.taken) continue;
      if (Math.abs(p.x + p.w / 2 - k.x) < 30 && Math.abs(p.y + p.h / 2 - k.y) < 32) {
        k.taken = true;
        this.keysFound++;
        this.score += 40;
        emitCotton(this, k.x, k.y, 10);
        this.hooks.onSound?.('boll');
        if (this.keysFound >= this.keys.length) {
          this.gateOpen = true;
          this.score += 100;
          this.hooks.onSound?.('gate');
        }
        this.emitHud();
      }
    }
  }

  gateX() {
    return (this.level.goalX - 3) * TILE;
  }

  // Blocos de plataforma quebram ao levar uma cabeçada e soltam um capulho de bônus.
  hitBlock(tx, ty) {
    if (ty < 0 || ty >= ROWS || tx < 0 || tx >= this.level.width) return;
    if (this.level.grid[ty][tx] !== 2) return;
    this.level.grid[ty][tx] = 0;
    const cx = tx * TILE + TILE / 2;
    const cy = ty * TILE + TILE / 2;
    this.bonuses.push({ x: cx, y: cy, vy: -7.4, t: 0 });
    if (this.level.blockStyle === 'rolo') emitCotton(this, cx, cy, 12);
    else emitDirt(this, cx, cy, 8);
    emitLeaves(this, cx, cy, 4);
    this.shake = 6;
    this.hooks.onSound?.('block');
  }

  updateBonuses() {
    const p = this.player;
    for (const b of this.bonuses) {
      b.t++;
      b.y += b.vy;
      b.vy += GRAVITY * 0.5;
      const touch =
        Math.abs(p.x + p.w / 2 - b.x) < 30 && Math.abs(p.y + p.h / 2 - b.y) < 32;
      if (touch || b.vy >= 0) {
        b.taken = true;
        this.collected++;
        this.score += 15;
        emitCotton(this, b.x, b.y, 8);
        this.hooks.onSound?.('boll');
        this.emitHud();
      }
    }
    this.bonuses = this.bonuses.filter((b) => !b.taken);
  }

  updateCuriosities() {
    if (this.finished) return;
    const p = this.player;
    for (const c of this.curiosities) {
      if (c.taken) continue;
      if (Math.abs(p.x + p.w / 2 - c.x) < 30 && Math.abs(p.y + p.h / 2 - c.y) < 34) {
        c.taken = true;
        this.factsFound++;
        this.score += 25;
        emitCotton(this, c.x, c.y, 7);
        emitLeaves(this, c.x, c.y, 4);
        this.hooks.onSound?.('fact');
        this.emitHud();
        this.hold = true;
        this.hooks.onFact?.(c);
        return;
      }
    }
  }

  updateParticles() {
    for (const pt of this.particles) {
      pt.life -= 1;
      pt.vy += pt.g ?? 0.16;
      pt.vx *= pt.drag ?? 0.97;
      if (pt.swayAmp) {
        pt.sway = (pt.sway ?? 0) + 0.14;
        pt.x += Math.cos(pt.sway) * pt.swayAmp;
      }
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.rot = (pt.rot ?? 0) + (pt.spin ?? 0);
    }
    this.particles = this.particles.filter((pt) => pt.life > 0);
  }

  updateCamera() {
    const target = clamp(
      this.player.x + this.player.w / 2 - VIEW_W * (this.focus ?? 0.42),
      -(this.edge ?? 0),
      this.level.width * TILE - VIEW_W + (this.edge ?? 0)
    );
    this.camera += (target - this.camera) * 0.14;
  }

  checkGoal() {
    if (this.finished) return;
    if (!this.gateOpen) return;
    // sem linha de chegada: a fase termina quando o chefão cai (depois do efeito de derrota)
    if (this.boss ? this.boss.dead && this.boss.deadT > 50 : this.player.x + this.player.w >= this.level.goalX * TILE - 6) {
      this.finished = true;
      this.hooks.onSound?.('win');
      this.emitHud();
      // a vitória só é anunciada depois da animação de final de fase
      this.finale = {
        t: 0,
        baseY: this.level.groundTop * TILE - this.player.h,
        result: { score: this.score, collected: this.collected, lives: this.lives },
      };
    }
  }

  hurt(force = false) {
    if (this.finished) return;
    const p = this.player;
    if (!force && (p.invuln > 0 || this.power > 0)) return;
    this.lives -= 1;
    this.shake = 16;
    emitDirt(this, p.x + p.w / 2, p.y + p.h, 6);
    emitLeaves(this, p.x + p.w / 2, p.y + p.h / 2, 4);
    this.hooks.onSound?.('hurt');
    this.emitHud();
    if (this.lives <= 0) {
      this.finished = true;
      this.hooks.onGameOver?.({ score: this.score, collected: this.collected });
      return;
    }
    // Levar dano não manda de volta ao checkpoint: o Dão é empurrado e pisca por um tempo.
    // Só a queda em buraco (force) faz voltar.
    if (!force) {
      p.invuln = 150;
      p.hurtFx = true;
      p.vy = -8;
      p.vx = -p.face * 5;
      return;
    }
    this.respawn();
  }

  render(ctx) {
    if (this.flightMode) {
      drawFlight(ctx, this);
      return;
    }
    drawScene(ctx, this);
  }
}
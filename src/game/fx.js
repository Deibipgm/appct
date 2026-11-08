import { VIEW_W, VIEW_H } from './config';

const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const SOIL = ['#D99A55', '#BB7038', '#95502A', '#EFC07E'];
const LEAF = ['#46C24A', '#86DE58', '#FFD23F', '#2AA84B'];
const FLUFF = ['#FFFDF7', '#F2F8FF', '#DCEBF7'];
const WATER = ['#8CDFF5', '#BEEFFF', '#5FC9EC'];

function push(eng, p) {
  eng.particles.push({ max: p.life, ...p });
}

// Terra levantada: pulo, aterrissagem e blocos quebrados.
export function emitDirt(eng, x, y, n = 6) {
  for (let i = 0; i < n; i++) {
    push(eng, {
      kind: 'clod',
      x: x + rnd(-11, 11),
      y: y - rnd(0, 7),
      vx: rnd(-2.2, 2.2),
      vy: rnd(-3.6, -0.7),
      g: 0.27,
      drag: 0.955,
      r: rnd(2, 4.2),
      rot: rnd(0, 6.28),
      spin: rnd(-0.22, 0.22),
      life: rnd(24, 42),
      color: pick(SOIL),
    });
  }
}

// Folhas girando no ar: impacto e inimigo derrotado.
export function emitLeaves(eng, x, y, n = 5) {
  for (let i = 0; i < n; i++) {
    push(eng, {
      kind: 'leaf',
      x: x + rnd(-14, 14),
      y: y + rnd(-8, 8),
      vx: rnd(-1.7, 1.7),
      vy: rnd(-2.6, -0.4),
      g: 0.12,
      drag: 0.97,
      swayAmp: 0.55,
      r: rnd(2.4, 4),
      rot: rnd(0, 6.28),
      spin: rnd(-0.16, 0.16),
      life: rnd(30, 50),
      color: pick(LEAF),
    });
  }
}

// Flocos de algodão que sobem devagar: coleta e curiosidade.
export function emitCotton(eng, x, y, n = 7) {
  for (let i = 0; i < n; i++) {
    push(eng, {
      kind: 'fluff',
      x: x + rnd(-9, 9),
      y: y + rnd(-9, 9),
      vx: rnd(-0.9, 0.9),
      vy: rnd(-2.1, -0.5),
      g: -0.015,
      drag: 0.985,
      swayAmp: 0.3,
      r: rnd(2.6, 5),
      life: rnd(30, 52),
      color: pick(FLUFF),
    });
  }
}

// Gotas de orvalho na grama.
export function emitDew(eng, x, y, n = 3) {
  for (let i = 0; i < n; i++) {
    push(eng, {
      kind: 'drop',
      x: x + rnd(-13, 13),
      y: y - rnd(0, 5),
      vx: rnd(-1.5, 1.5),
      vy: rnd(-2.4, -0.6),
      g: 0.2,
      drag: 0.96,
      r: rnd(1.7, 2.9),
      life: rnd(18, 30),
      color: pick(WATER),
    });
  }
}

// Poeira de pólen ao fundo: sutil, sem parallax.
export function emitMote(eng) {
  push(eng, {
    kind: 'mote',
    x: eng.camera + rnd(-60, VIEW_W + 60),
    y: rnd(90, VIEW_H - 130),
    vx: rnd(-0.3, 0.3),
    vy: rnd(-0.45, -0.12),
    g: 0,
    drag: 1,
    swayAmp: 0.22,
    r: rnd(1.3, 2.4),
    life: rnd(150, 260),
    color: Math.random() > 0.55 ? '#FFF0B8' : '#FFFFFF',
  });
}
// Cena viva do painel de referência: mesmo enquadramento do estudo visual,
// em coordenadas lógicas 960x540 que cabem inteiras na tela (sem rolagem).
export const STAGE = { w: 960, h: 540, ground: 452 };

export const BLOCKS = [
  { x: 262, y: 368, w: 152, h: 84 },
  { x: 614, y: 392, w: 124, h: 60 },
  // sequência de obstáculos que leva até a chegada
  { x: 686, y: 404, w: 56, h: 48 },
  { x: 752, y: 380, w: 58, h: 72 },
  { x: 822, y: 404, w: 50, h: 48 },
];

export const COIN_SPOTS = [
  [168, 352],
  [214, 296],
  [300, 300],
  [356, 332],
  [462, 398],
  [548, 340],
  [648, 300],
  [784, 392],
  [862, 336],
];

export const HERO_START = { x: 112, y: STAGE.ground - 62 };

export const WEEVIL = { minX: 436, maxX: 592, w: 52, h: 44 };
export const FLY = { minX: 672, maxX: 884, w: 50, h: 38, baseY: 296 };

export const GOAL = { x: 902, triggerX: 886 };
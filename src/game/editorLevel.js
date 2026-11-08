import { ROWS } from './config';
import { LEVELS } from './levels';

export const EMPTY = 0;
export const GROUND = 1;
export const PLATFORM = 2;
export const BALE = 3;

export const GROUND_ROW = 8;
export const MIN_WIDTH = 24;
export const MAX_WIDTH = 160;

export const PRESETS = LEVELS.map((l) => ({ id: l.id, label: l.name }));

export function themeFor(preset) {
  return (LEVELS.find((l) => l.id === preset) ?? LEVELS[0]).theme;
}

export function obstacleStyleFor(preset) {
  if (preset === 'algodoeira') return 'fardinho';
  return preset === 'colheita' ? 'cotton' : 'blue';
}

export function blankLevel(preset = 'plantio', width = 48) {
  const rows = Array.from({ length: ROWS }, (_, y) =>
    Array.from({ length: width }, () => (y >= GROUND_ROW ? GROUND : EMPTY))
  );
  return {
    name: 'Minha fase',
    preset,
    rows,
    bolls: [],
    goldens: [],
    items: [],
    enemies: [],
    startX: 3,
    goalX: width - 4,
  };
}

const withCell = (level, x, y, value) => ({
  ...level,
  rows: level.rows.map((row, ry) =>
    ry === y ? row.map((cell, cx) => (cx === x ? value : cell)) : row
  ),
});

const togglePoint = (level, key, x, y) => {
  const list = level[key];
  const hit = list.find(([px, py]) => px === x && py === y);
  return { ...level, [key]: hit ? list.filter((p) => p !== hit) : [...list, [x, y]] };
};

function placeMarker(level, asset, x, y) {
  if (asset === 'boll') return togglePoint(level, 'bolls', x, y);
  if (asset === 'golden') return togglePoint(level, 'goldens', x, y);
  if (asset === 'item') return togglePoint(level, 'items', x, y);

  const type = asset === 'whitefly' ? 'whitefly' : 'weevil';
  const skin = asset === 'folharao' || asset === 'casca' ? asset : undefined;
  const row = type === 'whitefly' ? Math.min(y, GROUND_ROW - 2) : GROUND_ROW - 1;
  const hit = level.enemies.find((e) => e.x === x && e.row === row);
  return {
    ...level,
    enemies: hit
      ? level.enemies.filter((e) => e !== hit)
      : [...level.enemies, { x, row, type, skin, range: type === 'whitefly' ? 3 : 2 }],
  };
}

function eraseAt(level, x, y) {
  const cleared = withCell(level, x, y, EMPTY);
  const samePoint = ([px, py]) => px === x && py === y;
  return {
    ...cleared,
    bolls: cleared.bolls.filter((p) => !samePoint(p)),
    goldens: cleared.goldens.filter((p) => !samePoint(p)),
    items: cleared.items.filter((p) => !samePoint(p)),
    enemies: cleared.enemies.filter((e) => !(e.x === x && e.row === y)),
  };
}

export function applyBrush(level, { tool, asset }, x, y) {
  const width = level.rows[0].length;
  if (x < 0 || y < 0 || x >= width || y >= ROWS) return level;

  if (asset === 'start') return { ...level, startX: x };
  if (asset === 'goal') return { ...level, goalX: Math.min(width - 2, Math.max(1, x)) };

  const isMarker = ['boll', 'golden', 'item', 'weevil', 'whitefly', 'folharao', 'casca'].includes(asset);
  if (isMarker) return tool === 'borracha' ? eraseAt(level, x, y) : placeMarker(level, asset, x, y);

  // borracha sobre um fardo remove só a pilha, sem furar o chão
  if (tool === 'borracha' && level.rows[y][x] === BALE) {
    let out = level;
    for (let cy = y; cy >= 0; cy--) {
      if (out.rows[cy][x] !== BALE) break;
      out = withCell(out, x, cy, EMPTY);
    }
    return out;
  }

  if (tool === 'borracha' || asset === 'buraco') {
    let out = level;
    const from = tool === 'borracha' ? y : Math.max(y, GROUND_ROW);
    for (let cy = from; cy < ROWS; cy++) out = withCell(out, x, cy, EMPTY);
    return out;
  }

  if (asset === 'terra') {
    let out = level;
    const from = tool === 'balde' ? GROUND_ROW : Math.max(y, GROUND_ROW);
    for (let cy = from; cy < ROWS; cy++) out = withCell(out, x, cy, GROUND);
    return out;
  }

  if (asset === 'plataforma') {
    if (y >= GROUND_ROW) return level;
    return withCell(level, x, y, PLATFORM);
  }

  if (asset === 'fardo') {
    if (y >= GROUND_ROW) return level;
    // empilha: cada fardo precisa de apoio no chão ou em outro fardo abaixo
    if (y < GROUND_ROW - 1 && level.rows[y + 1][x] !== BALE) return level;
    return withCell(level, x, y, BALE);
  }

  return level;
}

export function resizeWidth(level, delta) {
  const width = level.rows[0].length;
  const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width + delta));
  if (next === width) return level;

  const rows = level.rows.map((row, y) => {
    if (next > width) {
      const fill = y >= GROUND_ROW ? GROUND : EMPTY;
      return [...row, ...Array.from({ length: next - width }, () => fill)];
    }
    return row.slice(0, next);
  });

  const inside = (p) => p[0] < next;
  return {
    ...level,
    rows,
    goalX: Math.min(level.goalX, next - 2),
    bolls: level.bolls.filter(inside),
    goldens: level.goldens.filter(inside),
    items: level.items.filter(inside),
    enemies: level.enemies.filter((e) => e.x < next),
  };
}

function runs(row, match) {
  const out = [];
  let start = -1;
  for (let x = 0; x < row.length; x++) {
    if (match(row[x])) {
      if (start < 0) start = x;
    } else if (start >= 0) {
      out.push({ x: start, w: x - start });
      start = -1;
    }
  }
  if (start >= 0) out.push({ x: start, w: row.length - start });
  return out;
}

export function toDef(level) {
  const width = level.rows[0].length;
  const pits = runs(level.rows[GROUND_ROW], (v) => v !== GROUND);

  const platforms = [];
  for (let y = 0; y < GROUND_ROW - 1; y++) {
    runs(level.rows[y], (v) => v === PLATFORM).forEach(({ x, w }) => platforms.push({ x, y, w }));
  }

  const heights = new Array(width).fill(0);
  for (let x = 0; x < width; x++) {
    for (let y = GROUND_ROW - 1; y >= 0; y--) {
      if (level.rows[y][x] !== BALE) break;
      heights[x] += 1;
    }
  }

  const obstacles = [];
  let runStart = -1;
  let runHeight = 0;
  for (let x = 0; x <= width; x++) {
    const h = x < width ? heights[x] : 0;
    if (runStart >= 0 && h !== runHeight) {
      obstacles.push({ x: runStart, w: x - runStart, h: runHeight });
      runStart = -1;
    }
    if (h > 0 && runStart < 0) {
      runStart = x;
      runHeight = h;
    }
  }

  return {
    id: level.preset,
    name: level.name || 'Minha fase',
    tag: 'Fase criada',
    mission: '',
    brief: '',
    tip: '',
    seal: '',
    width,
    groundTop: GROUND_ROW,
    startX: Math.min(level.startX, width - 3),
    goalX: Math.min(level.goalX, width - 2),
    theme: themeFor(level.preset),
    obstacleStyle: obstacleStyleFor(level.preset),
    blockStyle: level.preset === 'plantio' ? 'rolo' : undefined,
    facts: [],
    pits,
    platforms,
    obstacles,
    enemies: level.enemies,
    bolls: level.bolls,
    items: level.items.map(([x, y], i) => [x, y, `Item ${i + 1}`, 'fiber']),
    golden: level.goldens,
  };
}

export function toSaved(level) {
  return {
    name: level.name || 'Minha fase',
    preset: level.preset,
    width: level.rows[0].length,
    groundTop: GROUND_ROW,
    startX: level.startX,
    goalX: level.goalX,
    grid: level.rows.map((row) => row.join('')),
    bolls: level.bolls,
    goldens: level.goldens,
    items: level.items,
    enemies: level.enemies,
  };
}

export function fromSaved(record) {
  const grid = record.grid ?? [];
  const width = grid[0]?.length ?? record.width ?? 48;
  const rows = Array.from({ length: ROWS }, (_, y) => {
    const source = grid[y] ?? '';
    return Array.from({ length: width }, (_, x) => {
      const raw = source[x];
      if (raw === undefined) return y >= GROUND_ROW ? GROUND : EMPTY;
      return Number(raw);
    });
  });

  return {
    name: record.name ?? 'Minha fase',
    preset: record.preset ?? 'plantio',
    rows,
    bolls: record.bolls ?? [],
    goldens: record.goldens ?? [],
    items: record.items ?? [],
    enemies: record.enemies ?? [],
    startX: record.startX ?? 3,
    goalX: record.goalX ?? Math.max(4, width - 4),
  };
}
import { LEVELS, buildLevel } from '../src/game/levels.js';
import { TILE } from '../src/game/config.js';
const out = [];
for (const def of LEVELS) {
  if (def.flight) continue; // Fase 6 (avião) não tem grade de blocos
  const L = buildLevel(def);
  const gt = L.groundTop;
  const solid = (x, y) => L.grid[y]?.[x] === 3 || L.grid[y]?.[x] === 1;
  const issues = [];
  const byKind = {};
  L.enemies.forEach((e, i) => {
    const k = e.skin || e.type; byKind[k] = (byKind[k] || 0) + 1;
    const c0 = Math.floor(e.minX / TILE), c1 = Math.floor(e.maxX / TILE);
    for (let c = c0; c <= c1; c++) {
      const row = Math.floor((e.baseY + e.h - 1) / TILE);
      if (e.type === 'weevil' && L.grid[row]?.[c] === 3) { issues.push(`inimigo #${i} (${k}, x=${Math.round(e.minX/TILE)}..${c1}) passa por dentro de obstáculo na coluna ${c}`); break; }
      if (e.type === 'weevil' && !L.grid[gt]?.[c]) { issues.push(`inimigo #${i} (${k}) patrulha sobre buraco na coluna ${c}`); break; }
    }
  });
  const xs = L.enemies.map((e) => Math.round(e.x / TILE)).sort((a, b) => a - b);
  const gaps = xs.slice(1).map((x, i) => x - xs[i]);
  const bad = L.bolls.filter((b) => solid(Math.floor(b.x / TILE), Math.floor(b.y / TILE)));
  const badK = L.keys.filter((b) => solid(Math.floor(b.x / TILE), Math.floor(b.y / TILE)));
  if (bad.length) issues.push(`${bad.length} capulho(s) dentro de bloco`);
  if (badK.length) issues.push(`${badK.length} item(ns) dentro de bloco`);
  const tall = (def.obstacles || []).filter((o) => (o.h ?? 1) >= 3 && !(def.springs||[]).length);
  out.push({
    id: def.id, width: L.width, enemies: L.enemies.length, porKind: byKind,
    inimigosPor100: +(L.enemies.length / L.width * 100).toFixed(1),
    menorDist: Math.min(...gaps), maiorDist: Math.max(...gaps),
    obstaculos: (def.obstacles || []).length, altos: tall.length,
    bolls: L.bolls.length, golden: L.golden.length, items: L.keys.length, springs: (L.springs||[]).length, pits: (def.pits||[]).length,
    issues,
  });
}
console.log(JSON.stringify(out, null, 1));

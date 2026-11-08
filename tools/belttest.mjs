import { GameEngine } from '../src/game/engine.js';
import { LEVELS, buildLevel } from '../src/game/levels.js';
for (const def of LEVELS) {
  const L = buildLevel(def);
  const col = (o) => Math.floor(o.x / 48);
  console.log(def.id, 'itens', L.keys.map((k) => `${k.label}@${col(k)}`).join(' '), '| curios', L.curiosities.map((k) => `${col(k)}`).join(' '), '| molas', L.springs.map(col).join(' '), '| buracos', (def.pits||[]).map((p) => `${p.x}-${p.x + p.w - 1}`).join(' '));
}
const def = LEVELS.find((l) => l.id === 'algodoeira');
for (const hold of [false, true]) {
  const e = new GameEngine(def, {});
  const sp = e.springs[0];
  e.player.x = sp.x - 15; e.player.y = sp.y - sp.h - e.player.h - 30; e.player.vx = 0; e.player.vy = 2; e.player.onGround = false;
  e.input.right = true; e.input.jump = hold;
  let on = false, maxx = 0, pushed = false;
  for (let i = 0; i < 260; i++) {
    e.step();
    const feet = e.player.y + e.player.h;
    if (Math.abs(feet - 288) < 1 && e.player.onGround) on = true;
    maxx = Math.max(maxx, e.player.x);
  }
  console.log('mola 1 -> esteira', { hold, subiuNaEsteira: on, xFinal: Math.round(e.player.x / 48), yFinal: Math.round(e.player.y + e.player.h) });
}
{
  const e = new GameEngine(def, {});
  const sp = e.springs[0];
  e.player.x = sp.x - 15; e.player.y = sp.y - sp.h - e.player.h - 30; e.player.vy = 2; e.player.onGround = false; e.input.right = true;
  const log = [];
  for (let i = 0; i < 200; i++) { e.step(); if (i % 20 === 0) log.push(`${Math.round(e.player.x)}/${Math.round(e.player.y + e.player.h)}`); }
  console.log(log.join(' '), 'vx', e.player.vx);
}

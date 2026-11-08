globalThis.__STRETCH = Number(process.env.ST ?? 1.55);
import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
const T = 48;
for (const L of LEVELS) {
  const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){}, onGameOver(){}, onSound(){}, onFact(){} });
  let maxX = 0, stuck = 0, last = 0, frames = 0, lives0 = e.lives;
  const solid = (c, r) => e.level.grid[r]?.[c] > 0;
  while (frames < 60 * 240 && !e.finished) {
    frames++;
    if (e.hold) e.hold = false; // fecha curiosidades
    const p = e.player; const inp = e.input;
    inp.right = true; inp.left = false; inp.jump = false; inp.punch = false;
    const col = Math.floor((p.x + p.w) / T), feet = Math.floor((p.y + p.h - 2) / T);
    const aheadWall = [1, 2].some((d) => solid(col + d, feet) || solid(col + d, feet - 1));
    const pit = !solid(col + 1, feet + 1) && !solid(col + 2, feet + 1) && p.onGround;
    const foe = e.enemies.some((q) => !q.dead && q.x > p.x && q.x - p.x < 120 && Math.abs(q.y - p.y) < 90);
    const spr = e.springs.some((s) => s.x > p.x && s.x - p.x < 70);
    if ((aheadWall || pit || foe || spr) && p.onGround) { inp.jump = true; inp.jumpTap = true; } else if (!p.onGround && p.vy < 0) inp.jump = true;
    if (e.boss && e.boss.active && !e.boss.dead) { inp.punch = frames % 20 === 0; inp.punchTap = inp.punch; }
    e.step();
    if (p.x > maxX) { maxX = p.x; stuck = 0; } else stuck++;
    if (stuck > 600) break;
  }
  console.log(L.id, 'goal', L.goalX, 'maxTile', Math.round(maxX / T), 'frames', frames, 'finished', e.finished, 'lives', e.lives, 'boss dead', e.boss?.dead);
}

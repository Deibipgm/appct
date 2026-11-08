import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
import { createDemoBot } from '../src/game/demoBot';
for (const L of LEVELS.filter((l) => !l.flight)) {
  let over = false, win = false;
  const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){ win = true; }, onGameOver(){ over = true; }, onSound(){}, onFact(){} });
  const bot = createDemoBot();
  let f = 0;
  while (f < 60 * 75 && !over && !win) { bot(e); e.step(); f++; }
  console.log(L.id, 'tiles', Math.round(e.player.x / 48), '/', L.goalX ?? e.level.width, 'secs', Math.round(f / 60), 'lives', e.lives, over ? 'GAMEOVER' : '', win ? 'WIN' : '', 'score', e.score);
}

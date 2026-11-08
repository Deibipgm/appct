import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
const L = LEVELS.find((l) => l.id === 'manejo');
const probe = new GameEngine(L, { lives: 5, onHud(){}, onWin(){}, onGameOver(){}, onSound(){}, onFact(){} });
const curiosities = probe.curiosities.map((c) => ({ x: c.x, y: c.y, title: c.title }));
for (const c of curiosities) {
  const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){}, onGameOver(){}, onSound(){}, onFact(){} });
  e.enemies.length = 0;
  e.player.x = c.x - 15;
  e.player.y = e.level.groundTop * 48 - e.player.h;
  e.player.onGround = true;
  e.camera = Math.max(0, c.x - 400);
  let got = false;
  for (let f = 0; f < 200; f++) {
    e.input.jump = f < 50;
    e.input.jumpTap = f === 0;
    e.step();
    if (e.hold) { got = true; e.hold = false; break; }
  }
  console.log(c.title, 'x=', Math.round(c.x/48), 'y=', Math.round(c.y/48), got ? 'ALCANÇADA' : 'NÃO ALCANÇADA');
}

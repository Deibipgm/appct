import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
const L = LEVELS.find((l) => l.id === 'manejo');
const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){}, onGameOver(){}, onSound(){}, onFact(){ } });
const tr = e.traps[0];
e.player.x = tr.x - 15; e.player.y = e.level.groundTop*48 - e.player.h;
const s0 = e.score;
for (let f = 0; f < 600; f++) { e.hold = false; e.player.invuln = 999; e.step(); }
console.log('caught', tr.caught, 'score', s0, '->', e.score, 'lured', e.enemies.filter(x=>x.lured).map(x=>[Math.round(x.x),x.dead]));

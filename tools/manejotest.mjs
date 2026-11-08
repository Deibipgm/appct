import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
import { createDemoBot } from '../src/game/demoBot';
import { missionStatus } from '../src/game/manejo';
const L = LEVELS.find((l) => l.id === 'manejo');
let win = false, over = false;
const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){ win = true; }, onGameOver(){ over = true; }, onSound(){}, onFact(){} });
const bot = createDemoBot();
let f = 0, revealAt = null, toasts = new Set();
while (f < 60 * 150 && !over && !win) {
  bot(e); e.step(); f++;
  if (e.toast) toasts.add(e.toast.text);
  if (revealAt === null && e.boss && !e.boss.hidden) revealAt = Math.round(f / 60);
}
console.log({ win, over, secs: Math.round(f / 60), lives: e.lives, score: e.score, mission: missionStatus(e), traps: e.traps.map((t) => t.caught), revealAt, piles: e.pilesBroken, facts: e.factsFound, toasts: [...toasts] });

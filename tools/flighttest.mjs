import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
import { createFlightBot } from '../src/game/flightBot';
const L = LEVELS.find((l) => l.flight);
for (const pilot of ['bot', 'parado']) {
  let over = false, win = false, facts = 0;
  const hurts = [];
  const e = new GameEngine(L, { lives: 5, onHud(){}, onWin(){ win = true; }, onGameOver(){ over = true; }, onSound(n){ if (n === 'hurt') hurts.push(Math.round(e.fl.dist / 48) + ':' + e.lastHurt); }, onFact(){ facts++; } });
  const bot = createFlightBot();
  let f = 0, bossAt = 0;
  while (f < 60 * 150 && !over && !win) {
    if (pilot === 'bot') bot(e); else if (e.hold) e.hold = false;
    e.step(); f++;
    if (e.fl.boss && !bossAt) bossAt = f;
  }
  const sp = e.fl.sp;
  console.log(pilot, 'secs', Math.round(f / 60), 'boss aos', Math.round(bossAt / 60), 's, vida do chefe', e.fl.boss?.hp, 'vidas', e.lives, over ? 'GAMEOVER' : '', win ? 'WIN' : '', 'pontos', e.score,
    'capulhos', e.collected, '/', e.fl.items.length, 'curiosidades', facts, 'bicudos pulverizados', sp.bugs.filter((b) => b.dead).length, '/', sp.bugs.length, 'danos em (bloco)', hurts.join(','));
}

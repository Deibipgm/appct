import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
import { hitBossWith } from '../src/game/boss';
for (const L of LEVELS) {
  const e = new GameEngine(L, { lives:3, onHud(){}, onWin(){}, onGameOver(){}, onSound(){}, onFact(){} });
  const b = e.boss;
  console.log(L.id, 'boss', b.kind, 'hp', b.hp, 'gateOpen', e.gateOpen);
  e.player.x = b.triggerX + 10;
  for (let i=0;i<20;i++) e.step();
  let seen=0, lives0=e.lives;
  for (let k=0;k<b.max+2 && !b.dead;k++) {
    b.hitT=0; hitBossWith(e, b.x+5, b.y+5, 5);
    seen=Math.max(seen,e.bossHearts.length);
    // pick heart
    for (const h of e.bossHearts) { e.player.x=h.x; e.player.y=h.ground; }
    for (let i=0;i<120;i++){ e.step(); if(b.dead)break; }
  }
  console.log(' dead',b.dead,'gateOpen',e.gateOpen,'maxHeartsSeen',seen,'lives',lives0,'->',e.lives);
}

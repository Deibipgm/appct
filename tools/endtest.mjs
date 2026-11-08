import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
for (const L of LEVELS) {
  let won=false;
  const e=new GameEngine(L,{lives:5,onHud(){},onWin(){won=true},onGameOver(){},onSound(){},onFact(){}});
  e.hold=false; const p=e.player; p.x=(L.goalX-18)*48; p.y=L.groundTop*48-p.h; p.onGround=true;
  let f=0, fin=-1;
  for(;f<600;f++){ e.step(); if(e.hold) e.hold=false; if(e.boss&&e.boss.active&&!e.boss.dead&&f===30){e.boss.hp=0; e.boss.dead=true; e.gateOpen=true;} if(e.finished&&fin<0)fin=f; }
  console.log(L.id,'boss',!!e.boss,'terminou no frame',fin,'finale',!!e.finale);
}

import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
const T=48; const L=LEVELS.find(l=>l.id==='fiacao');
for (const [vx] of [[64],[122]]) {
  const e=new GameEngine(L,{lives:5,onHud(){},onWin(){},onGameOver(){},onSound(){},onFact(){}});
  const p=e.player; p.x=(vx+1.5)*T-p.w/2; p.y=10*T-2*T-p.h; p.onGround=true; e.hold=false;
  let minY=1e9, flyFrames=0, maxX=p.x, done=false;
  for(let f=0;f<900;f++){
    e.input.right = f>200; e.step(); if(e.hold) e.hold=false;
    minY=Math.min(minY,p.y); if(p.flyT>0&&!p.onGround) flyFrames++;
    if(f>200 && p.onGround && flyFrames>0 && !done){ console.log('vent',vx,'pousou em x tile',(p.x/T).toFixed(1),'frame',f); done=true; }
  }
  console.log('final x',(p.x/T).toFixed(1),'y',Math.round(p.y),'lives',e.lives);console.log('vent',vx,'minY',Math.round(minY),'(chão 480) voo frames',flyFrames,'subiu',Math.round(480-96-p.h-minY));
}

import { GameEngine } from '../src/game/engine';
import { LEVELS } from '../src/game/levels';
const T=48; const L=LEVELS.find(l=>l.id==='fiacao');
function mk(){return new GameEngine(L,{lives:5,onHud(){},onWin(){},onGameOver(){},onSound(){},onFact(){}});}
// 1) mola -> ponte alta
{
  const e=mk(); const p=e.player; p.x=31*T; p.y=10*T-p.h; p.onGround=true; e.hold=false;
  let on=false, maxy=1e9, hist=[];
  e.input.right=true;
  for(let f=0;f<400;f++){ if(f===2){e.input.jump=true;e.input.jumpTap=true;} if(f>8) e.input.jump = f<30; e.step(); maxy=Math.min(maxy,p.y); if(p.onGround && p.y+p.h<=6*T+2) {on=true;break;} if(e.hold) e.hold=false; }
  console.log('mola->ponte alta:',on,'x',Math.round(p.x/T),'minY',Math.round(maxy),'y+h',Math.round(p.y+p.h),'springs',e.springs.map(s=>Math.round(s.x/T)));
}
// 2) corda 1: pulo correndo da beira do vão
for (const startTile of [66,67,68,69,70,71]) {
  const e=mk(); const p=e.player; p.x=startTile*T; p.y=10*T-p.h; p.onGround=true; e.hold=false; e.input.right=true;
  let grabbed=false, released=false, landed=null, f=0;
  for(;f<600;f++){
    if(f===1){e.input.jump=true;e.input.jumpTap=true;}
    if(p.rope) grabbed=true;
    // solta quando balançando para frente perto do auge
    if(p.rope && p.rope.ang>0.9 && !released){ e.input.jumpTap=true; e.input.jump=true; released=true; } else if(f>1 && !p.rope) e.input.jump=released?false:e.input.jump;
    e.step(); if(e.hold) e.hold=false;
    if(released && p.onGround){landed=Math.round(p.x/T); break;}
    if(p.y>600) {landed='caiu'; break;}
  }
  console.log('corda1 start',startTile,'grabbed',grabbed,'released',released,'landed',landed,'frames',f, 'ang max?');
}
// 3) vão 2 (84..93) com duas cordas (85 e 91)
for (const startTile of [81,82,83]) {
  const e=mk(); const p=e.player; p.x=startTile*T; p.y=10*T-p.h; p.onGround=true; e.hold=false; e.input.right=true;
  let grabs=0, last=null, landed=null, f=0, releasedAt=-1; let prevRope=null;
  for(;f<900;f++){
    if(f===1){e.input.jump=true;e.input.jumpTap=true;}
    if(p.rope && p.rope!==prevRope){grabs++; prevRope=p.rope; releasedAt=-1;}
    if(!p.rope) prevRope=null;
    if(p.rope && p.rope.ang>0.95 && releasedAt<0){ e.input.jumpTap=true; e.input.jump=true; releasedAt=f; } else if(f>1) e.input.jump = f<24 && !p.rope;
    e.step(); if(e.hold) e.hold=false;
    if(grabs>0 && p.onGround){landed=Math.round(p.x/T);break;}
    if(p.y>600){landed='caiu';break;}
  }
  console.log('vao2 start',startTile,'grabs',grabs,'landed',landed,'f',f);
}

// Piloto automático da demonstração do modo feira: anda para a frente, pula paredes,
// buracos, molas e inimigos, dá soco no que estiver perto e no chefão.
import { TILE } from './config';

export function createDemoBot() {
  let frames = 0;
  let bestX = 0;
  let stuck = 0;
  let back = 0;
  let longJump = 0;
  let hop = 0;
  const bot = (e) => {
    frames++;
    if (e.hold) e.hold = false; // fecha curiosidades sozinho
    const p = e.player;
    const inp = e.input;
    if (!p) return;
    const solid = (c, r) => (e.level.grid[r]?.[c] ?? 0) > 0;
    const col = Math.floor((p.x + p.w) / TILE);
    const feet = Math.floor((p.y + p.h - 2) / TILE);

    if (p.x > bestX + 4) {
      bestX = p.x;
      stuck = 0;
      bot.stalled = 0;
    } else {
      stuck++;
      bot.stalled++;
    }
    // travou: recua um pouco e tenta um pulo mais comprido
    if (stuck > 150 && back <= 0) {
      back = 22;
      longJump = 40;
      stuck = 0;
      bestX = p.x;
    }

    inp.left = back > 0;
    inp.right = back <= 0;
    if (back > 0) back--;

    const wall = [1, 2].some((d) => solid(col + d, feet) || solid(col + d, feet - 1));
    const pit = p.onGround && !solid(col + 1, feet + 1) && !solid(col + 2, feet + 1);
    const foe = e.enemies.some((q) => !q.dead && q.x > p.x - 10 && q.x - p.x < 130 && Math.abs(q.y - p.y) < 90);
    // capulho-mola: para em cima dele, dá um pulinho para quicar e segura o pulo no impulso
    const cx = p.x + p.w / 2;
    const sp = e.springs.find((q) => q.x - cx > -14 && q.x - cx < 150);
    if (sp && back <= 0 && !p.boost) {
      const dx = sp.x - cx;
      if (p.onGround && Math.abs(dx) < 12 && hop <= 0) hop = 30;
      if (hop > 0 || (p.onGround && dx < 40)) {
        inp.right = dx > 4 && p.onGround;
        inp.left = dx < -4 && p.onGround;
      }
    }
    if (hop > 0) {
      hop--;
      const tap = hop === 29;
      if (tap) inp.jumpTap = true;
      inp.jump = tap;
      inp.punch = false;
      return;
    }
    if (p.boost) {
      inp.jump = true;
      inp.right = true;
      inp.left = false;
      return;
    }
    const spring = false;
    const close = e.enemies.some((q) => !q.dead && Math.abs(q.x - p.x) < 70 && Math.abs(q.y - p.y) < 50);
    const boss = e.boss && e.boss.active && !e.boss.dead;

    let jump = false;
    if (p.onGround && (wall || pit || spring || (foe && !close) || (longJump > 0 && back <= 0))) jump = true;
    else if (!p.onGround && p.vy < 0) jump = true; // segura para pular alto
    if (longJump > 0) longJump--;
    if (boss && p.onGround && frames % 70 === 0) jump = true;
    if (jump && !inp.jump) inp.jumpTap = true;
    inp.jump = jump;

    const punch = (close || (boss && frames % 18 === 0)) && frames % 6 === 0;
    if (punch) inp.punchTap = true;
    inp.punch = punch;
    inp.throw = false;
    if (boss && frames % 50 === 0) inp.throwTap = true;
  };
  bot.stalled = 0; // quadros sem avançar (a demonstração troca de fase se travar)
  return bot;
}

// Piloto automático do avião (demonstração do modo feira na Fase 6): atira sem parar,
// sobe por cima de torres, postes e pivôs, busca capulhos e desvia da gosma dos inimigos.
import { boxesOf } from './flightGround';

export function createFlightBot() {
  const bot = (e) => {
    bot.stalled = 0;
    if (e.hold) e.hold = false; // fecha curiosidades sozinho
    const fl = e.fl;
    if (!fl) return;
    const pl = fl.plane;
    const inp = e.input;
    inp.throw = true;
    const cy = pl.y + pl.h / 2;
    let target = 230;
    // 1) obstáculo do chão chegando: voa por cima dele
    let ceiling = Infinity;
    for (const o of fl.ground) {
      if (!o.live || o.gone) continue;
      const bs = boxesOf(o);
      const x0 = Math.min(...bs.map((b) => b.x));
      const x1 = Math.max(...bs.map((b) => b.x + b.w));
      if (x1 < pl.x - 10 || x0 > pl.x + pl.w + 260) continue;
      ceiling = Math.min(ceiling, Math.min(...bs.map((b) => b.y)));
    }
    // 2) algo para pegar à frente (capulho, dourado, pulverização, curiosidade)
    const goods = [...fl.items, ...fl.goldens, ...fl.facts, ...fl.sp.pickups].filter((it) => it.live && !it.taken && it.x > pl.x && it.x < pl.x + 420);
    goods.sort((a, b) => a.x - b.x);
    // 3) inimigo para mirar
    const foes = fl.foes.filter((f) => f.t >= 0 && f.kind !== 'tempestade' && f.x > pl.x + 40);
    foes.sort((a, b) => a.x - b.x);
    if (fl.boss && !fl.boss.dead) target = fl.boss.y + fl.boss.h * 0.6;
    else if (goods.length) target = goods[0].y;
    else if (foes.length) target = foes[0].y + foes[0].h / 2;
    if (ceiling < Infinity) target = Math.min(target, ceiling - pl.h / 2 - 34);
    // 4) desvia da gosma que vem na direção do avião e do raio da tempestade
    for (const s of fl.foeShots) {
      if (s.vx >= -0.5) continue;
      const dx = s.x - (pl.x + pl.w);
      const tt = dx / -s.vx; // quadros até a gosma chegar no avião
      if (tt < -25 || tt > 70) continue;
      const py = s.y + s.vy * Math.max(0, tt);
      if (Math.abs(py - cy) < 55) target = py > cy || cy > 330 ? Math.min(target, py - 95) : Math.max(target, py + 95);
    }
    let goX = 200;
    for (const f of fl.foes) {
      if (f.t < 0) continue;
      if (f.kind === 'tempestade') {
        // passa por baixo da nuvem e sai da coluna do raio quando ela pisca
        if (f.x < pl.x + pl.w + 200 && f.x + f.w > pl.x - 20) target = Math.max(target, f.y + f.h + 60);
        const bx = f.x + f.w / 2;
        if (f.bolt > -20 && f.bolt < 60 && Math.abs(bx - (pl.x + pl.w / 2)) < pl.w / 2 + 50) goX = bx > pl.x + pl.w / 2 ? bx - pl.w - 80 : bx + 80;
      }
      // percevejo investindo na mesma altura: sai da frente
      if (f.kind === 'percevejo' && f.dash && f.x > pl.x && Math.abs(f.y + f.h / 2 - cy) < 50) target = f.y + f.h / 2 > cy ? f.y - 70 : f.y + f.h + 70;
    }
    if (ceiling < Infinity) target = Math.min(target, ceiling - pl.h / 2 - 34);
    target = Math.max(60, Math.min(target, 400));
    inp.up = target < cy - 8;
    inp.down = target > cy + 8;
    goX = Math.max(30, Math.min(goX, 640));
    inp.left = pl.x > goX + 20;
    inp.right = pl.x < goX - 20;
  };
  bot.stalled = 0;
  return bot;
}

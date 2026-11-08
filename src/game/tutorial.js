import { TILE, VIEW_W } from './config';
import { INK, rr } from './brush';

// Dicas da Fase 1 (uma por vez, no primeiro contato com cada coisa) + aviso de ponto salvo + bandeira do checkpoint.
const STEPS = [
  {
    id: 'andar',
    text: 'Use as setas (ou os botões) para andar',
    show: () => true,
    done: (e) => e.player.x > e.level.startX * TILE + 5 * TILE,
  },
  {
    id: 'pular',
    text: 'Toque em PULAR. Segure para pular mais alto',
    show: (e) => e.player.x > e.level.startX * TILE + 5 * TILE,
    done: (e) => e.tutor.jumped,
  },
  {
    id: 'algodao',
    text: 'Pegue os capulhos de algodão para somar pontos',
    show: (e) => e.collected === 0 && e.player.x > e.level.startX * TILE + 6 * TILE,
    done: (e) => e.collected > 0,
  },
  {
    id: 'inimigo',
    text: 'Pise em cima do inimigo para derrotar, ou use o SOCO',
    show: (e) => e.enemies.some((n) => !n.dead && n.type !== 'whitefly' && n.x - e.player.x > 0 && n.x - e.player.x < 7 * TILE),
    done: (e) => e.enemies.some((n) => n.dead) || e.tutor.punched,
  },
  {
    id: 'mola',
    text: 'Capulho-mola: pise nele para um super pulo',
    show: (e) => e.springs.some((s) => s.x - e.player.x > 0 && s.x - e.player.x < 6 * TILE),
    done: (e) => e.springs.some((s) => s.squash > 0.2),
  },
];

export function initTutorial(eng) {
  eng.tutor = { on: !!eng.level.tutorial, i: 0, timer: 0, jumped: false, punched: false, doneIds: {} };
  eng.toast = null;
  eng.flags = [];
}

export function toast(eng, text) {
  eng.toast = { text, t: 0 };
}

export function addCheckpointFlag(eng, x) {
  eng.flags = (eng.flags ?? []).slice(-1);
  eng.flags.push({ x, t: 0 });
  toast(eng, 'Ponto salvo!');
}

export function updateTutorial(eng) {
  if (eng.toast && ++eng.toast.t > 110) eng.toast = null;
  (eng.flags ?? []).forEach((f) => f.t++);
  const t = eng.tutor;
  if (!t || !t.on) return;
  if (eng.input.jump) t.jumped = true;
  if (eng.input.punch) t.punched = true;
  while (t.i < STEPS.length && t.doneIds[STEPS[t.i].id]) t.i++;
  const s = STEPS[t.i];
  if (!s) return;
  if (s.id === 'checkpoint' && !(eng.flags ?? []).length) return; // só aparece depois do primeiro checkpoint
  if (!s.show(eng)) return;
  t.timer++;
  if (s.done(eng) && t.timer > 70) {
    t.doneIds[s.id] = true;
    t.timer = 0;
  } else if (t.timer > 330) {
    t.doneIds[s.id] = true;
    t.timer = 0;
  }
}

export function drawTutorial(ctx, eng) {
  const t = eng.tutor;
  let text = null;
  let a = 1;
  let y = 56;
  if (eng.toast) {
    text = eng.toast.text;
    a = Math.min(1, eng.toast.t / 10, (110 - eng.toast.t) / 14);
    y = eng.toastY ?? 104;
  } else if (t?.on) {
    const s = STEPS[t.i];
    if (s && t.timer > 0 && !(s.id === 'checkpoint' && !(eng.flags ?? []).length)) {
      text = s.text;
      a = Math.min(1, t.timer / 12);
    }
  }
  if (!text) return;
  ctx.save();
  ctx.globalAlpha = Math.max(0, a);
  ctx.font = '800 21px Nunito, system-ui, sans-serif';
  const w = ctx.measureText(text).width + 44;
  const x = (VIEW_W - w) / 2;
  ctx.beginPath();
  rr(ctx, x, y - 22, w, 44, 16);
  ctx.fillStyle = '#FFFDF7';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, VIEW_W / 2, y + 1);
  ctx.restore();
}

export function drawFlags(ctx, eng) {
  const gy = eng.level.groundTop * TILE;
  (eng.flags ?? []).forEach((f) => {
    const x = f.x - eng.camera;
    if (x < -60 || x > VIEW_W + 60) return;
    const wave = Math.sin(f.t * 0.2) * 4;
    ctx.lineWidth = 3;
    ctx.strokeStyle = INK;
    ctx.fillStyle = '#B97A44';
    ctx.fillRect(x - 3, gy - 78, 6, 78);
    ctx.strokeRect(x - 3, gy - 78, 6, 78);
    ctx.beginPath();
    ctx.moveTo(x + 3, gy - 76);
    ctx.quadraticCurveTo(x + 22, gy - 80 + wave, x + 40, gy - 68 + wave * 0.5);
    ctx.quadraticCurveTo(x + 22, gy - 56 - wave, x + 3, gy - 56);
    ctx.closePath();
    ctx.fillStyle = '#F0273A';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, gy - 80, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD23F';
    ctx.fill();
    ctx.stroke();
  });
}

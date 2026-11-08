// Controle USB (estilo Super Nintendo, Xbox, genéricos) pela Gamepad API do navegador.
// Funciona no navegador e no APK (WebView do Android, controle ligado por cabo OTG).
//
// Botões do jogo, pensando no controle do Super Nintendo:
//   D-pad / analógico esquerdo ... andar (e escolher botões nos menus)
//   B (baixo) ou X (cima) ........ pular
//   Y (esquerda) ou R ............ soco
//   A (direita) ou L ............. jogar algodão
//   Start ........................ pausar / continuar  (nos menus: confirmar)
//   Select ....................... pausar
//   Nos menus: A, B ou Start confirmam o botão destacado.
//
// Controles genéricos de SNES costumam vir sem o mapeamento "standard": o D-pad aparece como
// eixos 0/1 (ou como um "hat" num eixo só, geralmente o 9) e os botões em outra ordem
// (o clássico 0079:0011 usa 0=X 1=A 2=B 3=Y). Tratamos os dois casos.

const HAT_TOL = 0.12;
// valores do "hat" (um eixo só para as 8 direções): -1 = cima, depois sentido horário
const HAT = [
  [-1, { up: 1 }],
  [-5 / 7, { up: 1, right: 1 }],
  [-3 / 7, { right: 1 }],
  [-1 / 7, { down: 1, right: 1 }],
  [1 / 7, { down: 1 }],
  [3 / 7, { down: 1, left: 1 }],
  [5 / 7, { left: 1 }],
  [1, { up: 1, left: 1 }],
];

const pressed = (b) => !!b && (typeof b === 'object' ? b.pressed || b.value > 0.5 : b > 0.5);

// eixos que já apareceram parados fora da faixa (> 1) são "hat" de D-pad
const rest = new Map();

function readHat(v) {
  for (const [val, dir] of HAT) if (Math.abs(v - val) < HAT_TOL) return dir;
  return null;
}

/** Lê um controle e devolve o estado já traduzido para o jogo. */
export function readPad(gp) {
  const b = gp.buttons || [];
  const ax = gp.axes || [];
  const s = { left: false, right: false, up: false, down: false, jump: false, punch: false, throw: false, start: false, select: false, confirm: false };
  const dir = (x, y, dead = 0.5) => {
    if (x < -dead) s.left = true;
    if (x > dead) s.right = true;
    if (y < -dead) s.up = true;
    if (y > dead) s.down = true;
  };

  if (gp.mapping === 'standard') {
    // 0 baixo (SNES B) · 1 direita (SNES A) · 2 esquerda (SNES Y) · 3 cima (SNES X)
    s.jump = pressed(b[0]) || pressed(b[3]);
    s.punch = pressed(b[2]) || pressed(b[5]) || pressed(b[7]);
    s.throw = pressed(b[1]) || pressed(b[4]) || pressed(b[6]);
    s.select = pressed(b[8]);
    s.start = pressed(b[9]);
    s.confirm = pressed(b[0]) || pressed(b[1]);
    if (pressed(b[12])) s.up = true;
    if (pressed(b[13])) s.down = true;
    if (pressed(b[14])) s.left = true;
    if (pressed(b[15])) s.right = true;
    dir(ax[0] ?? 0, ax[1] ?? 0);
  } else {
    // genérico SNES USB: 0 X · 1 A · 2 B · 3 Y · 4 L · 5 R · 8 Select · 9 Start
    s.jump = pressed(b[2]) || pressed(b[0]);
    s.punch = pressed(b[3]) || pressed(b[5]) || pressed(b[7]);
    s.throw = pressed(b[1]) || pressed(b[4]) || pressed(b[6]);
    s.select = pressed(b[8]);
    s.start = pressed(b[9]);
    s.confirm = pressed(b[1]) || pressed(b[2]);
    // alguns trazem o D-pad como botões 12–15 mesmo sem o mapeamento padrão
    if (b.length > 15) {
      if (pressed(b[12])) s.up = true;
      if (pressed(b[13])) s.down = true;
      if (pressed(b[14])) s.left = true;
      if (pressed(b[15])) s.right = true;
    }
    dir(ax[0] ?? 0, ax[1] ?? 0);
    // D-pad como "hat": um eixo só (o 9 no Chrome) que parado fica fora da faixa (~1,28)
    let hats = rest.get(gp.index);
    if (!hats) rest.set(gp.index, (hats = new Set()));
    for (let i = 2; i < ax.length; i++) if (ax[i] > 1.05) hats.add(i);
    for (let i = 2; i < ax.length; i++) {
      if (i !== 9 && !hats.has(i)) continue;
      const h = readHat(ax[i]);
      if (!h) continue;
      if (h.up) s.up = true;
      if (h.down) s.down = true;
      if (h.left) s.left = true;
      if (h.right) s.right = true;
    }
  }
  return s;
}

export function listPads() {
  try {
    return Array.from(navigator.getGamepads?.() || []).filter((g) => g && g.connected !== false);
  } catch {
    return []; // bloqueado (ex.: página dentro de um quadro sem permissão)
  }
}

/** Junta todos os controles ligados num estado só. */
export function readAll() {
  const out = { left: false, right: false, up: false, down: false, jump: false, punch: false, throw: false, start: false, select: false, confirm: false };
  const pads = listPads();
  for (const gp of pads) {
    const s = readPad(gp);
    for (const k in out) if (s[k]) out[k] = true;
  }
  return { state: out, count: pads.length, name: pads[0]?.id || '' };
}

export function forgetPad(index) {
  rest.delete(index);
}

// ---------- navegação nos menus (sem mexer em cada tela) ----------

const FOCUSABLE = 'button, a[href], input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])';

function visibleTargets() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return Array.from(document.querySelectorAll(FOCUSABLE)).filter((el) => {
    if (el.disabled || el.closest('[data-pad-skip],[aria-hidden="true"],[inert]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    if (r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) {
      // fora da tela: só vale se der para rolar até ele (listas compridas)
      if (r.right < 0 || r.left > vw) return false;
    }
    const st = getComputedStyle(el);
    return st.visibility !== 'hidden' && st.pointerEvents !== 'none' && Number(st.opacity) > 0.05;
  });
}

const center = (r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

/** Leva o destaque para o botão mais próximo na direção pedida. */
export function moveFocus(dx, dy) {
  const list = visibleTargets();
  if (!list.length) return null;
  const cur = document.activeElement;
  if (!cur || !list.includes(cur)) return focusEl(pickFirst(list));
  const c = center(cur.getBoundingClientRect());
  let best = null;
  let bestScore = Infinity;
  for (const el of list) {
    if (el === cur) continue;
    const p = center(el.getBoundingClientRect());
    const vx = p.x - c.x;
    const vy = p.y - c.y;
    const along = vx * dx + vy * dy; // distância na direção pedida
    if (along <= 4) continue;
    const across = Math.abs(vx * dy) + Math.abs(vy * dx);
    const score = along + across * 2.2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  if (!best) {
    // chegou na borda: dá a volta em listas simples (cima/baixo)
    const sorted = [...list].sort((a, b) => {
      const pa = center(a.getBoundingClientRect());
      const pb = center(b.getBoundingClientRect());
      return dy ? pa.y - pb.y || pa.x - pb.x : pa.x - pb.x || pa.y - pb.y;
    });
    best = dx + dy > 0 ? sorted[0] : sorted[sorted.length - 1];
    if (best === cur) return cur;
  }
  return focusEl(best);
}

function pickFirst(list) {
  // prefere o botão principal da tela (o maior, mais alto na tela, ou marcado com data-pad-first)
  const marked = list.find((el) => el.hasAttribute('data-pad-first'));
  if (marked) return marked;
  let best = list[0];
  let bestA = 0;
  for (const el of list) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') continue;
    const r = el.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) continue;
    const a = r.width * r.height;
    if (a > bestA * 1.15) {
      bestA = a;
      best = el;
    }
  }
  return best;
}

function focusEl(el) {
  if (!el) return null;
  document.documentElement.classList.add('pad-nav');
  try {
    el.focus({ preventScroll: true });
  } catch {
    el.focus();
  }
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  return el;
}

/** Se nenhum botão da tela estiver destacado, destaca o principal (tela nova, com controle ligado). */
export function ensureFocus() {
  const cur = document.activeElement;
  if (cur && cur !== document.body && cur.isConnected && !cur.closest('[data-pad-skip]')) {
    const r = cur.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return cur;
  }
  const list = visibleTargets();
  return list.length ? focusEl(pickFirst(list)) : null;
}

/** Aperta o botão destacado (ou destaca o principal, se nada estiver destacado). */
export function confirmFocus() {
  const list = visibleTargets();
  const cur = document.activeElement;
  if (cur && list.includes(cur)) {
    if (cur.tagName === 'INPUT' || cur.tagName === 'TEXTAREA') {
      // campo de texto: confirma o formulário (ex.: salvar nome no ranking)
      const form = cur.closest('form');
      if (form) form.requestSubmit?.();
      return cur;
    }
    cur.click();
    return cur;
  }
  return focusEl(pickFirst(list));
}

export function leavePadNav() {
  document.documentElement.classList.remove('pad-nav');
}

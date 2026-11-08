// Modo feira/evento: jogo em tela cheia numa TV ou PC, com demonstração automática quando
// ninguém está jogando, volta sozinho ao menu e ranking só do dia.
// Liga e desliga tocando 5 vezes em "Desenvolvido por Deibi Soares", com Ctrl+Shift+F
// ou abrindo o jogo com ?feira=1 no endereço.
const KEY = 'superdao-feira';

export const DEMO_AFTER = 40; // segundos parado no menu até começar a demonstração
export const BACK_TO_MENU_AFTER = 75; // segundos sem ninguém mexer em outra tela até voltar ao menu
export const DEMO_LENGTH = 75; // segundos de cada demonstração

export function isFeira() {
  try {
    const q = new URLSearchParams(window.location.search).get('feira');
    if (q === '1' || q === '0') localStorage.setItem(KEY, q);
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setFeira(on) {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* sem armazenamento: vale só até fechar */
  }
}

export function enterFullscreen() {
  const el = document.documentElement;
  if (document.fullscreenElement || !el.requestFullscreen) return;
  el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}

export function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Ranking local (fica guardado neste aparelho). Top 10 por pontuação.
// No modo feira o ranking é só do dia (uma lista por data) e pode ser zerado.
import { isFeira, today } from './feira';

const BASE = 'superdao-ranking-v1';
const MAX = 10;
const key = () => (isFeira() ? `${BASE}-feira-${today()}` : BASE);

export function loadRanking() {
  try {
    const list = JSON.parse(localStorage.getItem(key()) || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function clearRanking() {
  try {
    localStorage.removeItem(key());
  } catch {
    /* nada a apagar */
  }
}

export function addToRanking(entry) {
  const item = {
    name: (entry.name || 'Jogador').trim().slice(0, 14) || 'Jogador',
    score: Math.max(0, Math.round(entry.score || 0)),
    collected: entry.collected || 0,
    learned: entry.learned || 0,
    date: Date.now(),
  };
  const list = [...loadRanking(), item].sort((a, b) => b.score - a.score || a.date - b.date).slice(0, MAX);
  try {
    localStorage.setItem(key(), JSON.stringify(list));
  } catch {
    /* sem armazenamento: o ranking só vale nesta sessão */
  }
  return { list, position: list.findIndex((x) => x.date === item.date) + 1 };
}

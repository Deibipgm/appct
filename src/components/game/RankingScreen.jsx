import { useState } from 'react';
import { Home, RotateCcw, Trophy, Trash2 } from 'lucide-react';
import { loadRanking, clearRanking } from '@/game/ranking';

const MEDAL = ['#FFD23F', '#D8DEE4', '#E0A36B'];

export default function RankingScreen({ highlight = 0, onMenu, onRestart, feira = false }) {
  const [, setTick] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const list = loadRanking();
  return (
    <div
      className="min-h-[100dvh] px-4 py-8"
      style={{ background: 'linear-gradient(180deg,#CFF6FF 0,#F7F2E7 520px,#F2ECD8 100%)' }}
    >
      <div className="mx-auto max-w-md rounded-[28px] border-4 border-[#1B120C] bg-[#FFFDF7] p-5 shadow-[8px_8px_0_#1B120C] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#1B120C] bg-[#FFD23F] shadow-[0_3px_0_#1B120C]">
            <Trophy className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-extrabold text-[#233022]">{feira ? 'Ranking de hoje' : 'Ranking'}</h1>
        </div>

        {list.length === 0 ? (
          <p className="mt-6 text-center text-sm font-semibold text-[#5B5648]">
            Ainda não há ninguém no ranking. Termine a aventura para ser o primeiro!
          </p>
        ) : (
          <ol className="mt-5 space-y-2">
            {list.map((r, i) => (
              <li
                key={r.date}
                className={`flex items-center gap-3 rounded-2xl border-[3px] border-[#1B120C] px-3 py-2 ${
                  i + 1 === highlight ? 'bg-[#FFE9A8]' : 'bg-[#F7F2E3]'
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1B120C] font-display text-sm font-black"
                  style={{ background: MEDAL[i] ?? '#FFFDF7' }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-display text-base font-extrabold text-[#233022]">{r.name}</span>
                <span className="font-display text-lg font-black tabular-nums text-[#1B120C]">{r.score}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {onRestart && (
            <button
              type="button"
              onClick={onRestart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-5 py-3 font-display text-base font-extrabold text-white shadow-[0_4px_0_#1B120C] active:translate-y-[2px] active:shadow-none"
            >
              <RotateCcw className="h-4 w-4" /> Jogar de novo
            </button>
          )}
          <button
            type="button"
            onClick={onMenu}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFFDF7] px-5 py-3 font-display text-base font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C] active:translate-y-[2px] active:shadow-none"
          >
            <Home className="h-4 w-4" /> Menu
          </button>
        </div>
        {feira && list.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (!confirm) return setConfirm(true);
              clearRanking();
              setConfirm(false);
              setTick((t) => t + 1);
            }}
            onBlur={() => setConfirm(false)}
            className="mx-auto mt-5 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-[#8E2B1E] underline-offset-2 hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirm ? 'Tem certeza? Toque de novo para zerar' : 'Zerar ranking de hoje'}
          </button>
        )}
      </div>
    </div>
  );
}

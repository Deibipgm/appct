import { RotateCcw, Home, Trophy } from 'lucide-react';

export default function GameOverOverlay({ score, collected, onRestart, onMenu, onRanking }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1B120C]/65 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] border-4 border-[#1B120C] bg-[#FFFDF7] p-6 text-center shadow-[8px_8px_0_#1B120C]">
        <span className="inline-block rounded-full border-[3px] border-[#1B120C] bg-[#FFD5D5] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8E2B1E] shadow-[0_3px_0_#1B120C]">
          Fim da tentativa
        </span>
        <h3 className="font-display mt-4 text-2xl font-black leading-tight text-[#1B120C]">
          O bicudo levou a melhor
        </h3>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5B5648]">
          Você fez <strong className="text-[#1B120C]">{score}</strong> pontos e colheu{' '}
          <strong className="text-[#1B120C]">{collected}</strong> capulhos.
        </p>
        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-5 py-3 font-display text-base font-extrabold text-white shadow-[0_4px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
          >
            <RotateCcw className="h-4 w-4" />
            Tentar de novo
          </button>
          {onRanking && (
            <button
              type="button"
              onClick={onRanking}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFD23F] px-5 py-2.5 font-display text-base font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
            >
              <Trophy className="h-4 w-4" />
              Entrar no ranking de hoje
            </button>
          )}
          <button
            type="button"
            onClick={onMenu}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFFDF7] px-5 py-2.5 font-display text-sm font-extrabold text-[#1B120C] shadow-[0_3px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
          >
            <Home className="h-4 w-4" />
            Voltar ao menu
          </button>
        </div>
      </div>
    </div>
  );
}
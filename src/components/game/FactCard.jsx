import { Sparkles, ArrowRight } from 'lucide-react';

export default function FactCard({ fact, onClose }) {
  if (!fact) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1B120C]/70 p-3 backdrop-blur-sm sm:p-6">
      <div className="relative w-full max-w-lg">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[26px] border-4 border-[#1B120C] bg-[#FFD23F]" />
        <div className="relative rounded-[26px] border-4 border-[#1B120C] bg-[#FFFDF7] p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 rounded-full border-2 border-[#1B120C] bg-[#FFD23F] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1B120C]">
              <Sparkles className="h-3.5 w-3.5" />
              Curiosidade
            </span>
            <span className="rounded-full border-2 border-[#1B120C] bg-[#0072BC] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
              +25 pontos
            </span>
          </div>

          <h3 className="font-display mt-4 text-2xl font-extrabold leading-tight text-[#1B120C] sm:text-3xl">
            {fact.title}
          </h3>
          <p className="mt-2 text-[14px] font-semibold leading-relaxed text-[#4A4033] sm:text-[15px]">
            {fact.text}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#1B120C] bg-[#E81E25] px-5 py-3 font-display text-base font-extrabold text-white shadow-[4px_4px_0_0_#1B120C] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            Entendi, vamos jogar
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
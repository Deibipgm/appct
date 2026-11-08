import { useState } from 'react';
import { Check, X, ArrowRight, Lightbulb, Medal } from 'lucide-react';

export default function QuizPanel({ quiz, levelTag, seal, onNext, onSound }) {
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;
  const correct = picked === quiz.answer;

  const choose = (index) => {
    if (answered) return;
    setPicked(index);
    if (index === quiz.answer) onSound?.('correct');
    else onSound?.('hurt');
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#22301F]/55 p-3 backdrop-blur-sm sm:p-6">
      <div className="w-full max-w-xl rounded-3xl border-4 border-[#1B120C] bg-[#FFFDF7] p-5 shadow-[8px_8px_0_0_#1B120C] sm:p-7">
        <div className="flex items-center gap-2">
          <span className="rounded-full border-[3px] border-[#1B120C] bg-[#FFD23F] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1B120C] shadow-[0_2px_0_#1B120C]">
            Quiz do agro
          </span>
          <span className="text-[11px] font-extrabold text-[#A2937A]">{levelTag}</span>
        </div>

        <h3 className="font-display mt-4 text-lg font-black leading-snug text-[#1B120C] sm:text-xl">
          {quiz.q}
        </h3>

        <div className="mt-4 space-y-2">
          {quiz.options.map((opt, i) => {
            const isAnswer = i === quiz.answer;
            const isPicked = picked === i;
            let cls =
              'border-[3px] border-[#1B120C] bg-white shadow-[0_3px_0_#1B120C] hover:bg-[#F7FAF2] text-[#3C4A38]';
            if (answered && isAnswer)
              cls = 'border-[3px] border-[#1B120C] bg-[#C9F2B0] shadow-[0_3px_0_#1B120C] text-[#215224]';
            else if (answered && isPicked)
              cls = 'border-[3px] border-[#1B120C] bg-[#FFD5D5] shadow-[0_3px_0_#1B120C] text-[#8E2B1E]';
            else if (answered) cls = 'border-[3px] border-[#D8D2C4] bg-white text-[#9A9385]';
            return (
              <button
                key={opt}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/30 text-[11px] font-bold">
                  {answered && isAnswer ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : answered && isPicked ? (
                    <X className="h-3.5 w-3.5" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFE9A8] px-4 py-3">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#8A6A1E]">
              <Lightbulb className="h-3.5 w-3.5" />
              {correct ? 'Boa! +100 pontos' : 'A resposta certa é a destacada'}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B5648]">{quiz.explain}</p>
            {quiz.fact && (
              <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-[12px] font-semibold leading-relaxed text-[#4A4033]">
                <span className="font-extrabold text-[#0072BC]">Sabia que? </span>
                {quiz.fact}
              </p>
            )}
          </div>
        )}

        {answered && seal && (
          <p className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#DCEBFF] px-4 py-2 text-center font-display text-[13px] font-extrabold text-[#245A86]">
            <Medal className="h-4 w-4" />
            Selo conquistado: {seal}
          </p>
        )}

        <button
          type="button"
          onClick={() => onNext(correct)}
          disabled={!answered}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-5 py-3 font-display text-base font-extrabold text-white shadow-[0_4px_0_#1B120C] transition enabled:active:translate-y-[2px] enabled:active:shadow-none disabled:opacity-40"
        >
          {answered ? 'Continuar' : 'Escolha uma resposta'}
          {answered && <ArrowRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { Trophy, Save, Home, RotateCcw, Delete } from 'lucide-react';
import { listPads } from '@/game/gamepad';

// Teclado na tela: com o controle (ou na feira, sem teclado) dá para escrever o nome com as setas e o A.
const ROWS = ['ABCDEFGHIJ', 'KLMNOPQRST', 'UVWXYZ'];
function LetterPad({ onKey }) {
  const key = 'h-10 min-w-[2.5rem] flex-1 rounded-lg border-[3px] border-[#1B120C] bg-white font-display text-base font-black text-[#1B120C] shadow-[0_3px_0_#1B120C] active:translate-y-[2px] active:shadow-none';
  return (
    <div className="mt-3 space-y-1.5">
      {ROWS.map((row) => (
        <div key={row} className="flex gap-1.5">
          {row.split('').map((c) => (
            <button key={c} type="button" className={key} onClick={() => onKey(c)}>{c}</button>
          ))}
          {row.length < 10 && (
            <>
              <button type="button" className={`${key} flex-[2]`} onClick={() => onKey(' ')}>espaço</button>
              <button type="button" aria-label="Apagar" className={`${key} flex flex-[2] items-center justify-center`} onClick={() => onKey('back')}><Delete className="h-5 w-5" /></button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// Resultado final: só o que o jogador aprendeu (as curiosidades que descobriu) + gravar no ranking.
export default function ResultScreen({ learned = [], score = 0, onSave, onRestart, onMenu, gameOver = false, feira = false }) {
  const [name, setName] = useState('');
  const [letters] = useState(() => feira || listPads().length > 0);
  const type = (c) => setName((n) => (c === 'back' ? n.slice(0, -1) : (n + c).slice(0, 14)));
  return (
    <div
      className="min-h-[100dvh] px-4 py-8"
      style={{ background: 'linear-gradient(180deg,#CFF6FF 0,#F7F2E7 520px,#F2ECD8 100%)' }}
    >
      <div className="mx-auto max-w-2xl rounded-[28px] border-4 border-[#1B120C] bg-[#FFFDF7] p-5 shadow-[8px_8px_0_#1B120C] sm:p-8">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-[#1B120C] bg-[#FFD23F] shadow-[0_3px_0_#1B120C]">
            <Trophy className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A2937A]">Super Dão</p>
            <h1 className="font-display text-2xl font-extrabold text-[#233022] sm:text-3xl">{gameOver ? 'Boa tentativa!' : 'Missão cumprida!'}</h1>
          </div>
        </div>

        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-[#A2937A]">Você aprendeu no caminho</p>
        {learned.length === 0 ? (
          <p className="mt-2 text-sm font-semibold text-[#5B5648]">
            Na próxima vez, pegue os ícones de curiosidade no caminho para aprender mais sobre o algodão!
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {learned.map((f) => (
              <li key={f.title} className="flex gap-2 rounded-xl bg-[#F7F2E3] px-3 py-2 text-[13px] leading-relaxed text-[#5B5648]">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#7CB35F]" />
                <span>
                  <span className="font-bold text-[#2F3D2E]">{f.title}: </span>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form
          className="mt-7 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFE9A8] p-4"
          onSubmit={(e) => { e.preventDefault(); onSave(name); }}
        >
          <label className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#6b5d3e]" htmlFor="rk-name">
            Entrar no ranking · {score} pontos
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="rk-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={14}
              placeholder="Seu nome"
              className="min-w-0 flex-1 rounded-xl border-[3px] border-[#1B120C] bg-white px-3 py-2 font-display text-base font-bold text-[#1B120C] outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-4 py-2 font-display text-base font-extrabold text-white shadow-[0_3px_0_#1B120C] active:translate-y-[2px] active:shadow-none"
            >
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
          {letters && <LetterPad onKey={type} />}
        </form>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onRestart} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFFDF7] px-5 py-3 font-display text-base font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C] active:translate-y-[2px] active:shadow-none">
            <RotateCcw className="h-4 w-4" /> Jogar de novo
          </button>
          <button type="button" onClick={onMenu} className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFFDF7] px-5 py-3 font-display text-base font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C] active:translate-y-[2px] active:shadow-none">
            <Home className="h-4 w-4" /> Menu
          </button>
        </div>
      </div>
    </div>
  );
}

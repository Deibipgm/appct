import { Play, Home, Gamepad2 } from 'lucide-react';

// Tela de pausa (Start do controle, Esc ou P no teclado).
export default function PauseOverlay({ onResume, onMenu }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#1B120C]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[26px] border-4 border-[#1B120C] bg-[#FFFDF7] p-6 text-center shadow-[8px_8px_0_#1B120C] [@media(max-height:500px)]:p-4">
        <span className="inline-block rounded-full border-[3px] border-[#1B120C] bg-[#FFE89A] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#5B4A2E] shadow-[0_3px_0_#1B120C]">
          Pausa
        </span>
        <h3 className="font-display mt-3 text-2xl font-black leading-tight text-[#1B120C]">Jogo pausado</h3>
        <div className="mt-5 space-y-2">
          <button
            type="button"
            data-pad-first
            autoFocus
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-5 py-3 font-display text-base font-extrabold text-white shadow-[0_4px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
          >
            <Play className="h-4 w-4 fill-white" />
            Continuar
          </button>
          <button
            type="button"
            onClick={onMenu}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFFDF7] px-5 py-2.5 font-display text-sm font-extrabold text-[#1B120C] shadow-[0_3px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
          >
            <Home className="h-4 w-4" />
            Voltar ao menu
          </button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] font-semibold leading-snug text-[#5B5648] [@media(max-height:500px)]:hidden">
          <Gamepad2 className="h-4 w-4 shrink-0" />
          Controle: B pula · Y soco · A joga algodão · Start pausa
        </p>
      </div>
    </div>
  );
}

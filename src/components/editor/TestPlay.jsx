import { useRef, useState } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import GameCanvas from '@/components/game/GameCanvas';
import TouchControls from '@/components/game/TouchControls';

export default function TestPlay({ levelDef, onExit }) {
  const engineRef = useRef(null);
  const [state, setState] = useState('playing');
  const [runId, setRunId] = useState(0);

  const restart = () => {
    setState('playing');
    setRunId((r) => r + 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#101d12] p-3">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 rounded-xl border-2 border-[#FFD23F] px-3 py-2 text-xs font-extrabold text-[#FFD23F]"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao editor
          </button>
          <p className="truncate text-sm font-extrabold text-white">{levelDef.name}</p>
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-2 rounded-xl border-2 border-white/40 px-3 py-2 text-xs font-extrabold text-white"
          >
            <RotateCcw className="h-4 w-4" /> Recomeçar
          </button>
        </div>

        <div className="relative overflow-hidden rounded-[26px] border-[3px] border-[#1B120C] bg-white">
          <GameCanvas
            key={runId}
            levelDef={levelDef}
            lives={3}
            paused={state !== 'playing'}
            onHud={() => {}}
            onWin={() => setState('win')}
            onGameOver={() => setState('over')}
            onSound={() => {}}
            onFact={() => {}}
            engineRef={engineRef}
          />

          {state !== 'playing' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#101d12]/80 p-6 text-center">
              <p className="text-2xl font-black text-white">
                {state === 'win' ? 'Chegou à porteira!' : 'O Dão tropeçou'}
              </p>
              <p className="max-w-sm text-sm font-semibold text-white/80">
                {state === 'win'
                  ? 'Sua fase está jogável. Ajuste o que quiser no editor.'
                  : 'Tente de novo ou volte ao editor para facilitar o caminho.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-xl bg-[#3f9a3c] px-4 py-2 text-sm font-extrabold text-[#fffbe8]"
                >
                  Jogar de novo
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="rounded-xl bg-[#FFD23F] px-4 py-2 text-sm font-extrabold text-[#3a2a0e]"
                >
                  Voltar ao editor
                </button>
              </div>
            </div>
          )}
        </div>

        <TouchControls engineRef={engineRef} />

        <p className="mt-3 text-center text-xs font-semibold text-white/60">
          Setas para andar · Espaço para pular · Shift para correr
        </p>
      </div>
    </div>
  );
}
import { useState } from 'react';
import SceneStage from './SceneStage';
import { paintScene } from './wonder/paint';
import { paintPainted } from './painted/paint';

const MODES = [
  {
    id: 'painted',
    label: 'Pintado Detalhado',
    paint: paintPainted,
    accent: '#F3DDB6',
    text: 'Pintura de fim de tarde: luz quente vindo da esquerda, sombra longa, ponte de madeira e capulhos brilhando. O chão recebe faixa de grama escura para não se perder no fundo.',
  },
  {
    id: 'wonder',
    label: 'Wonder Saturado',
    paint: paintScene,
    accent: '#86D6F5',
    text: 'Contorno grosso, cor no talo e sombra chapada — a linguagem que o jogo usa hoje, para continuar legível no celular.',
  },
];

export default function StudyPanel() {
  const [mode, setMode] = useState('painted');
  const active = MODES.find((item) => item.id === mode) ?? MODES[0];

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-black leading-tight text-[#1B120C] sm:text-3xl">
          A cena em movimento
        </h2>
        <span className="rounded-full border-[3px] border-[#1B120C] bg-[#3DBE4F] px-3 py-[3px] text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_3px_0_#1B120C]">
          jogável
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {MODES.map((item) => {
          const isActive = item.id === active.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              aria-pressed={isActive}
              className={`rounded-full border-[3px] border-[#1B120C] px-4 py-1.5 font-display text-xs font-extrabold transition ${
                isActive
                  ? 'bg-[#1B120C] text-[#FFFDF7] shadow-[0_3px_0_#7A6A52]'
                  : 'bg-[#FFFDF7] text-[#1B120C] shadow-[0_3px_0_#1B120C] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-[#5B5648]">{active.text}</p>

      <div className="mt-5">
        <SceneStage
          key={active.id}
          paint={active.paint}
          accent={active.accent}
          label={`Estudo em movimento: ${active.label}`}
        />
      </div>
    </section>
  );
}
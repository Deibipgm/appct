const EFFECTS = [
  {
    name: 'Terra',
    bg: '#F7E4C6',
    where: 'Pulo, aterrissagem e blocos quebrados.',
    dots: [
      { s: 8, c: '#95502A' },
      { s: 12, c: '#BB7038' },
      { s: 6, c: '#EFC07E' },
    ],
  },
  {
    name: 'Folhas',
    bg: '#E7F6DC',
    where: 'Inimigo derrotado e impacto forte no chão.',
    dots: [
      { s: 7, c: '#2AA84B' },
      { s: 12, c: '#46C24A' },
      { s: 8, c: '#FFD23F' },
    ],
  },
  {
    name: 'Algodão',
    bg: '#EDF6FF',
    where: 'Coleta de capulhos, bônus e curiosidades.',
    dots: [
      { s: 9, c: '#FFFDF7' },
      { s: 13, c: '#F2F8FF' },
      { s: 7, c: '#DCEBF7' },
    ],
  },
  {
    name: 'Água',
    bg: '#DFF4FB',
    where: 'Orvalho na grama ao pousar e respingos leves.',
    dots: [
      { s: 7, c: '#5FC9EC' },
      { s: 11, c: '#8CDFF5' },
      { s: 6, c: '#BEEFFF' },
    ],
  },
];

export default function EffectsConcept() {
  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-black leading-tight text-[#1B120C] sm:text-3xl">
          Conceito de efeitos
        </h2>
        <span className="rounded-full border-[3px] border-[#1B120C] bg-[#FFD23F] px-3 py-[3px] text-[10px] font-black uppercase tracking-[0.14em] text-[#1B120C] shadow-[0_3px_0_#1B120C]">
          naturais e leves
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm font-semibold leading-relaxed text-[#5B5648]">
        Cada partícula nasce do próprio material do campo e dura menos de um segundo, para dar impacto sem
        esconder o caminho nem os inimigos.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EFFECTS.map((effect) => (
          <div
            key={effect.name}
            className="rounded-[22px] border-[3px] border-[#1B120C] bg-[#FFFDF7] p-4 shadow-[0_6px_0_#1B120C]"
          >
            <div
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C]"
              style={{ background: effect.bg }}
            >
              {effect.dots.map((dot, i) => (
                <span
                  key={i}
                  className="rounded-full border-2 border-[#1B120C]"
                  style={{ width: dot.s, height: dot.s, background: dot.c }}
                />
              ))}
            </div>
            <p className="mt-3 font-display text-base font-extrabold text-[#1B120C]">{effect.name}</p>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-[#5B5648]">{effect.where}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
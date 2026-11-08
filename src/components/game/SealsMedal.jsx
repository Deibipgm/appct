// Medalha formada pelos seis selos conquistados nas fases (um a cada 60 graus).
const POSITIONS = Array.from({ length: 6 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 3;
  return { x: Math.round(Math.cos(a) * 100), y: Math.round(Math.sin(a) * 100) };
});

function Boll({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="9" fill="#FFFDF7" />
      <circle cx="12" cy="22" r="6.5" fill="#FFFDF7" />
      <circle cx="28" cy="22" r="6.5" fill="#FFFDF7" />
      <circle cx="20" cy="12" r="6.5" fill="#FFFDF7" />
    </svg>
  );
}

export default function SealsMedal({ seals }) {
  return (
    <div className="relative mx-auto h-[270px] w-[270px]">
      <div className="absolute left-1/2 top-1/2 h-[132px] w-[132px] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#1B120C] bg-[#3F8A3C] shadow-[0_6px_0_#1B120C]">
        <div className="flex h-full w-full flex-col items-center justify-center">
          <Boll className="h-12 w-12" />
          <p className="mt-1 px-2 text-center font-display text-[10px] font-black uppercase leading-tight tracking-[0.12em] text-[#FFFBE8]">
            Medalha do
            <br />
            algodão
          </p>
        </div>
      </div>

      {POSITIONS.map((pos, i) => {
        const seal = seals[i];
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
          >
            <div
              className={`flex h-[74px] w-[74px] flex-col items-center justify-center rounded-full border-4 text-center font-display text-[9px] font-black uppercase leading-[1.15] tracking-[0.04em] ${
                seal
                  ? 'border-[#1B120C] bg-[#FFD23F] text-[#3A2A0E] shadow-[0_4px_0_#1B120C]'
                  : 'border-dashed border-[#B9AE95] bg-[#F3EFE2] text-[#A79C84]'
              }`}
            >
              <span className="mb-0.5 text-[13px] leading-none">{seal ? '★' : '?'}</span>
              <span className="px-1.5">{seal ? seal.name : 'Selo'}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
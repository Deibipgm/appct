import { Image } from '@/components/ui/image';

const ICONS = {
  solo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#4aa046" aria-hidden="true">
      <path d="M12 22V11" />
      <path d="M12 12C12 7 8 5 3 5c0 5 3 8 9 7zM12 14c0-4 3-6 8-6 0 5-3 7-8 6z" />
    </svg>
  ),
  plantio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2f7fb8" aria-hidden="true">
      <path d="M12 2s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />
    </svg>
  ),
  crescimento: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#b8602f" aria-hidden="true">
      <ellipse cx="12" cy="13" rx="6" ry="7" />
      <path d="M9 7 6 3M15 7l3-4" stroke="#b8602f" strokeWidth="2" />
    </svg>
  ),
  colheita: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#d9a21b" aria-hidden="true">
      <path d="M12 2c2 4 2 8 0 12-2-4-2-8 0-12zM6 8c3 1 4 4 4 8-3-1-5-4-4-8zM18 8c1 4-1 7-4 8 0-4 1-7 4-8zM11 14h2v8h-2z" />
    </svg>
  ),
  algodoeira: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#5b6b78" aria-hidden="true">
      <path d="M2 22V10l6 4V10l6 4V4h4v18z" />
    </svg>
  ),
  laboratorio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#c0392b" aria-hidden="true">
      <path d="M9 2h6v2h-1v5l5 10a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l5-10V4H9z" />
    </svg>
  ),
};

export default function PhaseCard({ level, image, onPlay }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Jogar a fase ${level.name}`}
      className="group flex flex-col overflow-hidden rounded-[22px] border-[3px] border-[#6e4f2c] bg-[#fffaf0] text-left shadow-[0_6px_0_#8a6a43] transition-[box-shadow,transform] duration-200 hover:-translate-y-[2px] hover:shadow-[0_8px_0_#8a6a43,0_16px_24px_-10px_rgba(60,50,20,0.4)] active:translate-y-[2px] active:shadow-[0_3px_0_#8a6a43] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#2f7fb8]"
    >
      <Image
        src={image}
        alt=""
        className="block aspect-[4/3] w-full border-b-[3px] border-[#6e4f2c] object-cover"
      />
      <div className="flex flex-1 flex-col px-[18px] pb-4 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#8a7a52]">
            {level.tag}
          </span>
          {ICONS[level.id]}
        </div>
        <h3 className="mt-2 text-[19px] font-black leading-tight text-[#2c4a24]">{level.name}</h3>
        <p className="mt-1.5 flex-1 text-[13px] leading-[1.5] text-[#5b5238]">{level.brief}</p>
        <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8a7a52]">
          Selo: {level.seal}
        </p>
        <span className="mt-3 flex items-center justify-center gap-2 rounded-xl border-2 border-[#1B120C] bg-[#3f9a3c] py-2 text-xs font-extrabold text-[#fffbe8] shadow-[0_3px_0_#1B120C] transition group-active:shadow-none">
          <PlayIcon />
          Jogar esta fase
        </span>
      </div>
    </button>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="#fffbe8" aria-hidden="true">
      <path d="M3 1.5 10 6l-7 4.5z" />
    </svg>
  );
}
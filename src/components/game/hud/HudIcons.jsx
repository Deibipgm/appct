// Ícones em estilo pixel-art usados no HUD do jogo.
const HEART = [
  [3, 2, 4, 2],
  [9, 2, 4, 2],
  [2, 4, 12, 3],
  [3, 7, 10, 3],
  [5, 10, 6, 2],
  [7, 12, 2, 1],
];

const COIN = [
  [5, 1, 6, 1],
  [3, 2, 10, 1],
  [2, 3, 12, 2],
  [1, 5, 14, 6],
  [2, 11, 12, 2],
  [3, 13, 10, 1],
  [5, 14, 6, 1],
];

const SHINE = [
  [7, 1, 2, 3],
  [7, 12, 2, 3],
  [1, 7, 3, 2],
  [12, 7, 3, 2],
  [3, 3, 2, 2],
  [11, 3, 2, 2],
  [3, 11, 2, 2],
  [11, 11, 2, 2],
  [5, 5, 6, 6],
];

function PixelSvg({ blocks, className, color }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      {blocks.map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={color} />
      ))}
    </svg>
  );
}

export function PixelHeart({ className = 'h-4 w-4' }) {
  return <PixelSvg blocks={HEART} className={className} color="#FF4D4D" />;
}

export function PixelCoin({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <PixelSvg blocks={COIN} className="h-full w-full" color="#FFC107" />
      <rect x="5" y="4" width="3" height="5" fill="#FFE082" />
    </svg>
  );
}

export function PixelShine({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <PixelSvg blocks={SHINE} className="h-full w-full" color="#FFB020" />
      <rect x="6" y="6" width="4" height="4" fill="#FFFDF7" />
    </svg>
  );
}

const SEAL = [
  [5, 1, 6, 1],
  [3, 2, 10, 2],
  [2, 4, 12, 5],
  [3, 9, 10, 2],
  [5, 11, 6, 1],
  [4, 12, 2, 4],
  [10, 12, 2, 4],
];

export function PixelSeal({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <PixelSvg blocks={SEAL} className="h-full w-full" color="#4E8C4A" />
      <rect x="6" y="5" width="4" height="4" fill="#FFFDF7" />
    </svg>
  );
}

export function PixelGoldenBoll({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <rect x="7" y="0" width="2" height="2" fill="#FFC107" />
      <rect x="0" y="7" width="2" height="2" fill="#FFC107" />
      <rect x="14" y="7" width="2" height="2" fill="#FFC107" />
      <rect x="7" y="14" width="2" height="2" fill="#FFC107" />
      <rect x="5" y="3" width="6" height="6" fill="#FFD54F" />
      <rect x="3" y="6" width="6" height="6" fill="#FFC107" />
      <rect x="8" y="6" width="5" height="6" fill="#FFC107" />
      <rect x="6" y="10" width="4" height="3" fill="#FFD54F" />
      <rect x="6" y="5" width="2" height="2" fill="#FFFDF7" />
    </svg>
  );
}

export function PixelBoll({ className = 'h-4 w-4' }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" shapeRendering="crispEdges">
      <rect x="5" y="2" width="6" height="6" fill="#FFFDF7" />
      <rect x="2" y="6" width="6" height="6" fill="#F2F8FF" />
      <rect x="8" y="6" width="6" height="6" fill="#F2F8FF" />
      <rect x="6" y="10" width="4" height="3" fill="#FFFDF7" />
      <rect x="7" y="12" width="2" height="2" fill="#4E8C4A" />
    </svg>
  );
}

// Ícones da barra superior, recortados da arte da barra (public/art/hud).
import { ART_BASE } from '@/game/sprites';

export function HudImg({ name, className = 'h-8 w-8' }) {
  return <img src={`${ART_BASE}hud/${name}.png`} alt="" draggable={false} className={`${className} select-none object-contain`} />;
}

export function HudHeart({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 64 60" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="hudHeart" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF7A7E" />
          <stop offset="0.5" stopColor="#F2323C" />
          <stop offset="1" stopColor="#C4121E" />
        </linearGradient>
      </defs>
      <path
        d="M32 56 C10 40 3 29 3 19 C3 10 10 4 18 4 C24 4 29 7 32 12 C35 7 40 4 46 4 C54 4 61 10 61 19 C61 29 54 40 32 56 Z"
        fill="url(#hudHeart)"
        stroke="#7A0E16"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M13 17 C13 12 17 9 21 9" stroke="#FFD0D2" strokeWidth="4.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const INK = '#1B120C';

export default function CottonSceneArt({ className = '' }) {
  return (
    <svg viewBox="0 0 560 420" className={className} role="img" aria-label="Dão, o super-herói do algodão, enfrenta o bicudo">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#57BEF0" />
          <stop offset="100%" stopColor="#EAF9FF" />
        </linearGradient>
        <pattern id="halftone" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2.6" fill={INK} opacity="0.12" />
        </pattern>
        <radialGradient id="dome" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#8ED8F8" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width="560" height="420" fill="url(#sky)" />
      <rect width="560" height="420" fill="url(#halftone)" />

      {/* speed lines */}
      <g stroke="#FFFFFF" strokeWidth="3" opacity="0.55" strokeLinecap="round">
        {Array.from({ length: 26 }).map((_, i) => {
          const a = (i / 26) * Math.PI * 2;
          const x1 = 280 + Math.cos(a) * 320;
          const y1 = 205 + Math.sin(a) * 320;
          const x2 = 280 + Math.cos(a) * 250;
          const y2 = 205 + Math.sin(a) * 250;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* energy dome */}
      <circle cx="290" cy="196" r="182" fill="url(#dome)" stroke="#FFFFFF" strokeWidth="5" opacity="0.85" />
      <circle cx="290" cy="196" r="182" fill="none" stroke="#8ED8F8" strokeWidth="2" opacity="0.7" />

      {/* impact burst behind the weevil */}
      <path
        d="M404 96 l22 34 38 -14 -8 40 42 10 -34 26 22 34 -42 -4 0 40 -32 -26 -28 28 -10 -38 -40 8 18 -36 -34 -22 40 -12 -10 -38 36 16 z"
        fill="#FFF200"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />

      {/* ground */}
      <path d="M0 366 Q 140 336 280 362 T 560 352 L560 420 L0 420 Z" fill="#7ED957" stroke={INK} strokeWidth="5" />
      <path d="M0 392 Q 160 372 320 392 T 560 386 L560 420 L0 420 Z" fill="#4FA83F" stroke={INK} strokeWidth="4" />

      {/* cotton plants */}
      {[
        { x: 62, y: 366 },
        { x: 508, y: 360 },
      ].map((p) => (
        <g key={p.x}>
          <path d={`M${p.x} ${p.y} q 5 -30 1 -54`} stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
          <ellipse cx={p.x - 11} cy={p.y - 32} rx="12" ry="7" fill="#5FC24A" stroke={INK} strokeWidth="4" transform={`rotate(-18 ${p.x - 11} ${p.y - 32})`} />
          <circle cx={p.x + 1} cy={p.y - 62} r="13" fill="#FFFDF7" stroke={INK} strokeWidth="4.5" />
          <circle cx={p.x - 10} cy={p.y - 56} r="9" fill="#FFFDF7" stroke={INK} strokeWidth="4.5" />
          <circle cx={p.x + 12} cy={p.y - 56} r="9" fill="#FFFDF7" stroke={INK} strokeWidth="4.5" />
        </g>
      ))}

      {/* Dô, o super-herói */}
      <g>
        {/* cape */}
        <path
          d="M156 136 C 108 152 74 196 62 246 C 96 232 128 232 156 214 C 176 202 190 178 190 160 Z"
          fill="#E81E25"
          stroke={INK}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {/* back arm */}
        <path d="M150 160 L 118 186" stroke={INK} strokeWidth="17" strokeLinecap="round" />
        <path d="M150 160 L 118 186" stroke="#0072BC" strokeWidth="9" strokeLinecap="round" />
        {/* legs */}
        <path d="M162 186 L 132 212" stroke={INK} strokeWidth="19" strokeLinecap="round" />
        <path d="M162 186 L 132 212" stroke="#0072BC" strokeWidth="11" strokeLinecap="round" />
        <path d="M132 212 L 118 216" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M132 212 L 118 216" stroke="#E81E25" strokeWidth="11" strokeLinecap="round" />
        <path d="M184 188 L 160 228" stroke={INK} strokeWidth="19" strokeLinecap="round" />
        <path d="M184 188 L 160 228" stroke="#0072BC" strokeWidth="11" strokeLinecap="round" />
        <path d="M160 228 L 146 234" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M160 228 L 146 234" stroke="#E81E25" strokeWidth="11" strokeLinecap="round" />

        {/* torso */}
        <ellipse cx="176" cy="164" rx="31" ry="32" fill="#0072BC" stroke={INK} strokeWidth="5" />
        {/* belt */}
        <path d="M146 180 h 60" stroke={INK} strokeWidth="15" strokeLinecap="round" />
        <path d="M146 180 h 60" stroke="#FFC20E" strokeWidth="9" strokeLinecap="round" />
        <rect x="168" y="173" width="16" height="15" rx="4" fill="#FFFDF7" stroke={INK} strokeWidth="4" />

        {/* forward arm with fist */}
        <path d="M198 152 L 248 138" stroke={INK} strokeWidth="18" strokeLinecap="round" />
        <path d="M198 152 L 248 138" stroke="#0072BC" strokeWidth="10" strokeLinecap="round" />
        <circle cx="258" cy="135" r="14" fill="#FFFDF7" stroke={INK} strokeWidth="5" />

        {/* cotton head */}
        <g>
          <circle cx="186" cy="96" r="30" fill={INK} />
          <circle cx="160" cy="112" r="20" fill={INK} />
          <circle cx="212" cy="112" r="20" fill={INK} />
          <circle cx="168" cy="78" r="19" fill={INK} />
          <circle cx="206" cy="78" r="18" fill={INK} />
          <circle cx="186" cy="96" r="26" fill="#FFFDF7" />
          <circle cx="163" cy="112" r="17" fill="#FFFDF7" />
          <circle cx="210" cy="112" r="17" fill="#FFFDF7" />
          <circle cx="170" cy="80" r="16" fill="#FFFDF7" />
          <circle cx="205" cy="80" r="15" fill="#FFFDF7" />
          <circle cx="180" cy="92" r="7" fill="#E7F1F6" />
        </g>
        {/* face */}
        <ellipse cx="176" cy="102" rx="7" ry="8.5" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" />
        <ellipse cx="199" cy="102" rx="7" ry="8.5" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" />
        <circle cx="178" cy="103" r="3.8" fill={INK} />
        <circle cx="201" cy="103" r="3.8" fill={INK} />
        <path d="M176 116 q 11 10 22 -2" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M168 88 l 12 -3" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M206 86 l -12 -2" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      </g>

      {/* bicudo atordoado */}
      <g>
        <ellipse cx="404" cy="238" rx="42" ry="30" fill="#8B5A39" stroke={INK} strokeWidth="5" />
        <ellipse cx="396" cy="244" rx="22" ry="14" fill="#B07A50" />
        <path d="M436 218 q 26 -10 34 -26" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M436 218 q 26 -10 34 -26" stroke="#8B5A39" strokeWidth="5" strokeLinecap="round" />
        <circle cx="470" cy="190" r="7" fill={INK} />
        {/* head */}
        <circle cx="376" cy="204" r="26" fill="#7B4E31" stroke={INK} strokeWidth="5" />
        <ellipse cx="360" cy="204" rx="9" ry="10" fill="#FFFFFF" stroke={INK} strokeWidth="4" />
        <circle cx="357" cy="205" r="4.5" fill={INK} />
        <path d="M350 190 l 18 6" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        {/* legs */}
        <path d="M382 262 l -10 26" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <path d="M404 266 l 0 26" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        <path d="M426 262 l 10 26" stroke={INK} strokeWidth="7" strokeLinecap="round" />
        {/* dizzy swirls */}
        <path d="M356 160 q 10 -12 20 0 q 10 12 -6 10" stroke="#FFC20E" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M392 152 q 12 -14 24 0 q 12 14 -8 12" stroke="#E81E25" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M424 168 q 9 -10 18 0" stroke="#0072BC" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* sign */}
        <g transform="rotate(-8 356 236)">
          <rect x="292" y="216" width="128" height="58" rx="6" fill="#E8D5A9" stroke={INK} strokeWidth="5" />
          <path d="M320 216 v 58" stroke="#C9B58A" strokeWidth="3" />
          <text x="356" y="241" textAnchor="middle" fontSize="13" fontFamily="'Baloo 2', system-ui, sans-serif" fontWeight="800" fill={INK}>
            Estômago
          </text>
          <text x="356" y="260" textAnchor="middle" fontSize="13" fontFamily="'Baloo 2', system-ui, sans-serif" fontWeight="800" fill={INK}>
            Vazio
          </text>
        </g>
      </g>

      {/* balão de fala */}
      <g>
        <path d="M196 300 l 6 -30 l 26 26 z" fill="#FFFFFF" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <rect x="28" y="296" width="330" height="104" rx="20" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
        <text x="46" y="322" fontSize="14.5" fontFamily="'Nunito', system-ui, sans-serif" fontWeight="700" fill={INK}>
          Para proteger a lavoura, os produtores
        </text>
        <text x="46" y="342" fontSize="14.5" fontFamily="'Nunito', system-ui, sans-serif" fontWeight="700" fill={INK}>
          cumprem o Vazio Sanitário: o campo fica
        </text>
        <text x="46" y="362" fontSize="14.5" fontFamily="'Nunito', system-ui, sans-serif" fontWeight="700" fill={INK}>
          um período sem plantas de algodão vivas,
        </text>
        <text x="46" y="382" fontSize="14.5" fontFamily="'Nunito', system-ui, sans-serif" fontWeight="700" fill={INK}>
          inclusive as que nascem sozinhas!
        </text>
      </g>
    </svg>
  );
}
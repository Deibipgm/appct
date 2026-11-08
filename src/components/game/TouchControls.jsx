import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Hand, Circle, Wind, Droplets } from 'lucide-react';

// Aparece em celular e tablet (tela de toque ou tela menor que um notebook).
const isTouchScreen = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || window.innerWidth < 1024);

function HoldButton({ onPress, onRelease, children, label, className = '', hideLabel = false }) {
  const handleDown = (e) => {
    e.preventDefault();
    // mantém o dedo "preso" ao botão mesmo se escorregar um pouco
    e.currentTarget.setPointerCapture?.(e.pointerId);
    navigator.vibrate?.(8);
    onPress();
  };
  const handleUp = (e) => {
    e.preventDefault();
    onRelease();
  };
  return (
    <div data-pad-skip className="flex flex-col items-center gap-1">
      <button
        type="button"
        aria-label={label}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerCancel={handleUp}
        onLostPointerCapture={handleUp}
        style={{ touchAction: 'none', WebkitTapHighlightColor: 'transparent' }}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative flex touch-none select-none items-center justify-center border-[3px] before:absolute before:-inset-3 before:content-[''] border-[#1B120C] text-[#1B120C] shadow-[0_5px_0_#1B120C] transition-none active:translate-y-[3px] active:shadow-none ${className}`}
      >
        {children}
      </button>
      {!hideLabel && <span className="select-none text-[10px] font-black uppercase tracking-wide text-[#5b4a2e] sm:text-xs">{label}</span>}
    </div>
  );
}

const PAD = 'h-14 w-14 rounded-[18px] bg-[#FFFDF7] sm:h-[72px] sm:w-[72px] sm:rounded-[22px]';
const ROUND = 'h-14 w-14 rounded-full sm:h-[72px] sm:w-[72px]';

export default function TouchControls({ engineRef, overlay = false, flight = false }) {
  if (!isTouchScreen()) return null;
  const set = (key, value) => {
    const eng = engineRef.current;
    if (eng) eng.input[key] = value;
  };
  const tap = (key) => () => { set(`${key}Tap`, true); set(key, true); };

  // Em celular deitado os botões flutuam sobre os cantos do jogo (translúcidos, sem texto).
  const o = overlay;
  const pad = o ? 'h-16 w-16 rounded-[20px] bg-[#FFFDF7]/70' : PAD;
  const round = o ? 'h-14 w-14 rounded-full' : ROUND;
  const ic = o ? 'h-6 w-6' : 'h-7 w-7 sm:h-9 sm:w-9';
  const wrap = o
    ? 'pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] [&>div]:pointer-events-auto'
    : 'mt-auto flex w-full items-end justify-between gap-2 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-4';

  // Fase 6 (avião): cruz de direções à esquerda e o botão do jato de algodão à direita
  if (flight) {
    const small = o ? 'h-14 w-14 rounded-[18px] bg-[#FFFDF7]/70' : 'h-12 w-12 rounded-[16px] bg-[#FFFDF7] sm:h-16 sm:w-16 sm:rounded-[20px]';
    const btn = (key, label, Icon) => (
      <HoldButton hideLabel label={label} onPress={() => set(key, true)} onRelease={() => set(key, false)} className={small}>
        <Icon className={ic} />
      </HoldButton>
    );
    return (
      <div className={wrap}>
        <div className={`grid grid-cols-3 grid-rows-2 gap-1 sm:gap-2 ${o ? 'opacity-80' : ''}`}>
          <div />
          {btn('up', 'Subir', ArrowUp)}
          <div />
          {btn('left', 'Voltar', ArrowLeft)}
          {btn('down', 'Descer', ArrowDown)}
          {btn('right', 'Avançar', ArrowRight)}
        </div>
        <div className={`flex items-end gap-2 sm:gap-4 ${o ? 'opacity-80' : ''}`}>
          <HoldButton
            hideLabel={o}
            label="Pulverizar"
            onPress={() => set('throw', true)}
            onRelease={() => set('throw', false)}
            className={`${o ? 'h-16 w-16' : 'h-14 w-14 sm:h-[72px] sm:w-[72px]'} rounded-full bg-[#4FC3FF] text-[#0B3A5A]`}
          >
            <Droplets className={o ? 'h-6 w-6' : 'h-7 w-7 sm:h-8 sm:w-8'} />
          </HoldButton>
          <HoldButton
            hideLabel={o}
            label="Jato"
            onPress={tap('punch')}
            onRelease={() => set('punch', false)}
            className={`${o ? 'h-[76px] w-[76px]' : 'h-16 w-16 sm:h-[88px] sm:w-[88px]'} rounded-full bg-[#F0273A] text-white`}
          >
            <Wind className={o ? 'h-7 w-7' : 'h-8 w-8 sm:h-10 sm:w-10'} />
          </HoldButton>
        </div>
      </div>
    );
  }

  return (
    <div className={wrap}>
      <div className={`flex gap-2 sm:gap-4 ${o ? 'opacity-80' : ''}`}>
        <HoldButton hideLabel={o} label="Voltar" onPress={() => set('left', true)} onRelease={() => set('left', false)} className={pad}>
          <ArrowLeft className={ic} />
        </HoldButton>
        <HoldButton hideLabel={o} label="Avançar" onPress={() => set('right', true)} onRelease={() => set('right', false)} className={pad}>
          <ArrowRight className={ic} />
        </HoldButton>
      </div>
      <div className={`flex items-end gap-2 sm:gap-4 ${o ? 'opacity-80' : ''}`}>
        <HoldButton hideLabel={o} label="Algodão" onPress={tap('throw')} onRelease={() => set('throw', false)} className={`${round} bg-[#FFFDF7]${o ? '/70' : ''}`}>
          <Circle className={`${o ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8'} fill-white`} />
        </HoldButton>
        <HoldButton hideLabel={o} label="Soco" onPress={tap('punch')} onRelease={() => set('punch', false)} className={`${round} bg-[#FFD23F]`}>
          <Hand className={o ? 'h-5 w-5' : 'h-6 w-6 sm:h-8 sm:w-8'} />
        </HoldButton>
        <HoldButton
          hideLabel={o}
          label="Pular"
          onPress={tap('jump')}
          onRelease={() => set('jump', false)}
          className={`${o ? 'h-[72px] w-[72px]' : 'h-16 w-16 sm:h-[88px] sm:w-[88px]'} rounded-full bg-[#F0273A] text-white`}
        >
          <ArrowUp className={o ? 'h-7 w-7' : 'h-8 w-8 sm:h-10 sm:w-10'} />
        </HoldButton>
      </div>
    </div>
  );
}

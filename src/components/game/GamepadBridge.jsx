import { useEffect, useRef, useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { readAll, moveFocus, confirmFocus, ensureFocus, leavePadNav } from '@/game/gamepad';

// up e down só pilotam o avião da Fase 6 (no chão o Dão pula com B)
const GAME_KEYS = ['left', 'right', 'up', 'down', 'jump', 'punch', 'throw'];
const FIRST_REPEAT = 0.38; // segundos segurando a seta até o destaque começar a andar sozinho
const REPEAT = 0.16;

/**
 * Liga o controle USB ao jogo: durante a fase ele mexe no herói; fora dela (menus, apresentação,
 * pausa, fim de jogo) as setas escolhem o botão e A/B/Start apertam.
 */
export default function GamepadBridge({ engineRef, phase, onPause, onActivity }) {
  const phaseRef = useRef(phase);
  const pauseRef = useRef(onPause);
  phaseRef.current = phase;
  pauseRef.current = onPause;
  const activityRef = useRef(onActivity);
  activityRef.current = onActivity;
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return undefined;
    let raf = 0;
    let prev = null;
    let count = 0;
    let lastPhase = phaseRef.current;
    let sinceFocus = 0;
    let held = { dir: '', t: 0, next: 0 };
    let last = performance.now();
    let toastTimer = 0;
    const show = (text) => {
      clearTimeout(toastTimer);
      setToast(text);
      toastTimer = setTimeout(() => setToast(null), 3200);
    };

    const releaseHero = () => {
      const eng = engineRef.current;
      if (!eng || !prev) return;
      for (const k of GAME_KEYS) if (prev[k]) eng.input[k] = false;
    };

    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const { state: s, count: n } = readAll();
      if (n !== count) {
        if (n > count) show('Controle conectado');
        else if (n === 0) show('Controle desconectado');
        if (n === 0) releaseHero();
        count = n;
      }
      const ph = phaseRef.current;
      if (ph !== lastPhase) {
        // trocou de tela: solta o que o controle segurava e não deixa um aperto "vazar" para a próxima
        if (lastPhase === 'playing') releaseHero();
        lastPhase = ph;
        if (prev) prev = { ...s };
      }
      if (n && prev) {
        const down = (k) => s[k] && !prev[k];
        const any = Object.keys(s).some(down);
        if (any) activityRef.current?.();
        if (ph === 'demo') {
          // demonstração do modo feira: qualquer botão só acorda o jogo (quem cuida é o Game)
        } else if (ph === 'playing') {
          const eng = engineRef.current;
          if (eng) {
            for (const k of GAME_KEYS) {
              if (s[k] !== prev[k]) {
                eng.input[k] = s[k];
                if (s[k] && !['left', 'right', 'up', 'down'].includes(k)) eng.input[`${k}Tap`] = true;
              }
            }
          }
          if (down('start') || down('select')) pauseRef.current?.(true);
        } else {
          // tela nova: destaca o botão principal para o A já funcionar no primeiro aperto
          sinceFocus += dt;
          if (sinceFocus > 0.3) {
            sinceFocus = 0;
            ensureFocus();
          }
          if (ph === 'paused' && down('start')) {
            pauseRef.current?.(false);
          } else if (down('confirm') || down('start') || down('jump')) {
            confirmFocus();
          }
          const d = s.up ? 'up' : s.down ? 'down' : s.left ? 'left' : s.right ? 'right' : '';
          if (d !== held.dir) {
            held = { dir: d, t: 0, next: FIRST_REPEAT };
            if (d) step(d);
          } else if (d) {
            held.t += dt;
            if (held.t >= held.next) {
              held.next += REPEAT;
              step(d);
            }
          }
        }
      }
      prev = s;
      raf = requestAnimationFrame(tick);
    };
    const step = (d) => {
      const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[d];
      moveFocus(dx, dy);
    };

    const onConnect = () => show('Controle conectado');
    const onPointer = () => leavePadNav();
    window.addEventListener('gamepadconnected', onConnect);
    window.addEventListener('pointerdown', onPointer, true);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(toastTimer);
      window.removeEventListener('gamepadconnected', onConnect);
      window.removeEventListener('pointerdown', onPointer, true);
    };
  }, [engineRef]);

  if (!toast) return null;
  return (
    <div
      role="status"
      data-pad-skip
      className="pointer-events-none fixed left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border-[3px] border-[#1B120C] bg-[#FFFDF7]/95 px-4 py-1.5 font-display text-sm font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C]"
    >
      <Gamepad2 className="h-5 w-5" />
      {toast}
    </div>
  );
}

import { memo, useEffect, useRef } from 'react';
import { VIEW_W, VIEW_H } from '@/game/config';
import { GameEngine } from '@/game/engine';
import { preloadArt } from '@/game/sprites';

function GameCanvas({ levelDef, lives, paused, onHud, onWin, onGameOver, onSound, onFact, engineRef, fit = false, autopilot = null }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ paused, onHud, onWin, onGameOver, onSound, onFact, autopilot });

  useEffect(() => {
    stateRef.current = { paused, onHud, onWin, onGameOver, onSound, onFact, autopilot };
  }, [paused, onHud, onWin, onGameOver, onSound, onFact, autopilot]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    preloadArt();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = VIEW_W * dpr;
    canvas.height = VIEW_H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const engine = new GameEngine(levelDef, {
      lives,
      onHud: (h) => stateRef.current.onHud?.(h),
      onWin: (r) => stateRef.current.onWin?.(r),
      onGameOver: (r) => stateRef.current.onGameOver?.(r),
      onSound: (n) => stateRef.current.onSound?.(n),
      onFact: (f) => stateRef.current.onFact?.(f),
    });
    engineRef.current = engine;

    // No celular a tela corta as laterais: ancoramos à esquerda e mantemos o herói no trecho visível.
    const ro = new ResizeObserver(() => {
      const r = canvas.getBoundingClientRect();
      const f = Math.min(1, r.width / r.height / (VIEW_W / VIEW_H));
      // a tela mostra só o meio da cena: deixamos a câmera ir além das bordas para ver início e chegada
      engine.edge = ((1 - f) / 2) * VIEW_W;
      engine.focus = f < 1 ? (1 - f) / 2 + f * 0.35 : 0.42;
    });
    ro.observe(canvas);

    const onKeyDown = (e) => {
      const k = e.code;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(k)) e.preventDefault();
      if (k === 'ArrowLeft' || k === 'KeyA') engine.input.left = true;
      if (k === 'ArrowRight' || k === 'KeyD') engine.input.right = true;
      if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') engine.input.jump = true;
      if (k === 'KeyJ' || k === 'KeyX' || k === 'KeyF') engine.input.punch = true;
      if (k === 'KeyK' || k === 'KeyC') engine.input.throw = true;
      // descer (só o avião da Fase 6 usa)
      if (k === 'ArrowDown' || k === 'KeyS') engine.input.down = true;
    };
    const onKeyUp = (e) => {
      const k = e.code;
      if (k === 'ArrowLeft' || k === 'KeyA') engine.input.left = false;
      if (k === 'ArrowRight' || k === 'KeyD') engine.input.right = false;
      if (k === 'ArrowUp' || k === 'KeyW' || k === 'Space') engine.input.jump = false;
      if (k === 'KeyJ' || k === 'KeyX' || k === 'KeyF') engine.input.punch = false;
      if (k === 'KeyK' || k === 'KeyC') engine.input.throw = false;
      if (k === 'ArrowDown' || k === 'KeyS') engine.input.down = false;
    };
    const onBlur = () => {
      engine.input = { left: false, right: false, jump: false, punch: false };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now) => {
      const dt = Math.min(0.06, (now - last) / 1000);
      last = now;
      const isPaused = stateRef.current.paused;
      engine.paused = isPaused;
      acc += dt;
      let guard = 0;
      // Passo fixo de 60 Hz com folga de 1,5 ms: sem isso o relógio do navegador faz o jogo dar
      // 0, 1 ou 2 passos por quadro e a tela "treme" mesmo com o herói em velocidade constante.
      while (acc >= 1 / 60 - 0.0015 && guard < 6) {
        // modo feira: na demonstração o piloto automático controla o Dão
        if (stateRef.current.autopilot && !isPaused) stateRef.current.autopilot(engine);
        engine.step();
        acc -= 1 / 60;
        guard++;
      }
      if (acc < 0) acc = 0;
      if (acc > 0.2) acc = 0;
      engine.render(ctx);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelDef, lives]);

  return (
    <canvas
      ref={canvasRef}
      className={fit ? 'block h-full w-auto max-w-full select-none object-contain' : 'block h-full w-full min-h-0 flex-1 select-none object-cover sm:h-auto sm:w-full sm:flex-none sm:object-contain'}
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, imageRendering: 'auto' }}
    />
  );
}

export default memo(GameCanvas);
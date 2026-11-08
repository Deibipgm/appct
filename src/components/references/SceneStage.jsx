import { useEffect, useRef, useState } from 'react';
import { STAGE } from './wonder/config';
import { createScene } from './wonder/scene';

const KEYS = {
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];

export default function SceneStage({ paint, accent = '#86D6F5', label = 'Cena animada do campo de algodão' }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const pressRef = useRef(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scene = createScene({ onCollect: setCount });
    sceneRef.current = scene;

    let scale = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.width * (STAGE.h / STAGE.w) * dpr);
      scale = canvas.width / STAGE.w;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      scene.update(dt);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      paint(ctx, scene);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sceneRef.current = null;
    };
  }, [paint]);

  const stageX = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return ((event.clientX - rect.left) / rect.width) * STAGE.w;
  };

  const handleKey = (event, active) => {
    const scene = sceneRef.current;
    if (!scene) return false;
    if (KEYS[event.code]) {
      scene.input[KEYS[event.code]] = active;
      return true;
    }
    if (JUMP_KEYS.includes(event.code)) {
      if (active) scene.jump();
      return true;
    }
    return false;
  };

  const handlePointerDown = (event) => {
    const scene = sceneRef.current;
    if (!scene) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    pressRef.current = { x: event.clientX, t: performance.now(), moved: false };
    scene.input.pointerX = stageX(event);
  };

  const handlePointerMove = (event) => {
    const scene = sceneRef.current;
    if (!scene || !pressRef.current) return;
    if (Math.abs(event.clientX - pressRef.current.x) > 10) pressRef.current.moved = true;
    scene.input.pointerX = stageX(event);
  };

  const handlePointerUp = () => {
    const scene = sceneRef.current;
    const press = pressRef.current;
    pressRef.current = null;
    if (!scene) return;
    scene.input.pointerX = null;
    if (press && !press.moved && performance.now() - press.t < 260) scene.jump();
  };

  return (
    <div className="rounded-[26px] border-[3px] border-[#1B120C] bg-[#FFFDF7] p-2 shadow-[0_7px_0_#1B120C]">
      <div
        tabIndex={0}
        role="application"
        aria-label={label}
        onKeyDown={(event) => {
          if (handleKey(event, true)) event.preventDefault();
        }}
        onKeyUp={(event) => {
          handleKey(event, false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative touch-none select-none overflow-hidden rounded-[19px] border-[3px] border-[#1B120C] outline-none focus-visible:ring-4 focus-visible:ring-[#2F7FB8]/40"
        style={{ background: accent }}
      >
        <canvas ref={canvasRef} className="block h-auto w-full" />

        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full border-[3px] border-[#1B120C] bg-[#FFFDF7] px-3 py-1 shadow-[0_3px_0_#1B120C]">
          <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="4.4" fill="#FFFDF7" stroke="#1B120C" strokeWidth="1.8" />
            <circle cx="5.6" cy="11" r="3.4" fill="#FFFDF7" stroke="#1B120C" strokeWidth="1.8" />
            <circle cx="14.4" cy="11" r="3.4" fill="#FFFDF7" stroke="#1B120C" strokeWidth="1.8" />
            <circle cx="10" cy="5.6" r="3.4" fill="#FFFDF7" stroke="#1B120C" strokeWidth="1.8" />
          </svg>
          <span className="font-display text-sm font-black text-[#1B120C]">{count}</span>
        </div>

        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full border-[3px] border-[#1B120C] bg-[#FFD23F] px-3 py-[3px] text-[10px] font-black uppercase tracking-[0.08em] text-[#1B120C] shadow-[0_3px_0_#1B120C]">
          Setas ou arraste · espaço ou toque
        </p>
      </div>
    </div>
  );
}
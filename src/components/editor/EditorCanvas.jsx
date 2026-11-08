import { useEffect, useRef, useState } from 'react';
import { TILE, ROWS } from '@/game/config';
import { rr, ink } from '@/game/brush';
import { drawGroundCell } from '@/game/ground';
import { drawBaleContainer } from '@/game/obstacles';
import { BALE, GROUND, PLATFORM } from '@/game/editorLevel';
import { themeFor, obstacleStyleFor } from '@/game/editorLevel';

function drawFlag(ctx, cx, groundY, color) {
  ctx.beginPath();
  ctx.moveTo(cx, groundY);
  ctx.lineTo(cx, groundY - 44);
  ink(ctx, 2.4, '#3A2C12');
  ctx.beginPath();
  ctx.moveTo(cx, groundY - 44);
  ctx.lineTo(cx + 22, groundY - 36);
  ctx.lineTo(cx, groundY - 28);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ink(ctx, 1.8);
}

function drawDot(ctx, cx, cy, r, fill) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ink(ctx, 1.8);
}

function drawLabel(ctx, cx, cy, text) {
  ctx.fillStyle = '#1B120C';
  ctx.font = '700 11px "Baloo 2", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, cx, cy);
  ctx.textAlign = 'left';
}

function paintScene(ctx, level, theme) {
  const width = level.rows[0].length;
  const W = width * TILE;
  const H = ROWS * TILE;
  const style = obstacleStyleFor(level.preset);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, theme.skyTop);
  sky.addColorStop(1, theme.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < width; x++) {
      const cell = level.rows[y][x];
      const sx = x * TILE;
      const sy = y * TILE;

      if (cell === GROUND) {
        drawGroundCell(ctx, sx, sy, x, y, theme, y === 0 || level.rows[y - 1][x] !== GROUND);
      } else if (cell === PLATFORM) {
        ctx.beginPath();
        rr(ctx, sx + 2, sy + 5, TILE - 4, TILE - 9, 12);
        ctx.fillStyle = '#B4703A';
        ctx.fill();
        ink(ctx, 2.8);
        ctx.beginPath();
        rr(ctx, sx + 2, sy + 5, TILE - 4, 12, 8);
        ctx.fillStyle = theme.grass;
        ctx.fill();
        ink(ctx, 2.4);
      } else if (cell === BALE) {
        drawBaleContainer(
          ctx,
          sx,
          sy,
          style,
          level.rows[y][x - 1] === BALE,
          level.rows[y][x + 1] === BALE,
          level.rows[y - 1]?.[x] === BALE,
          level.rows[y + 1]?.[x] === BALE
        );
      }
    }
  }

  // grade de edição
  ctx.strokeStyle = 'rgba(27, 18, 12, 0.16)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x++) {
    ctx.beginPath();
    ctx.moveTo(x * TILE + 0.5, 0);
    ctx.lineTo(x * TILE + 0.5, H);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE + 0.5);
    ctx.lineTo(W, y * TILE + 0.5);
    ctx.stroke();
  }

  const mid = (v) => v * TILE + TILE / 2;
  const groundY = 8 * TILE;

  drawFlag(ctx, mid(level.startX), groundY, '#3F9A3C');
  drawFlag(ctx, mid(level.goalX), groundY, '#E81E25');

  level.bolls.forEach(([x, y]) => drawDot(ctx, mid(x), mid(y), 10, '#FFFDF7'));
  level.goldens.forEach(([x, y]) => drawDot(ctx, mid(x), mid(y), 11, '#FFD24A'));
  level.items.forEach(([x, y], i) => {
    drawDot(ctx, mid(x), mid(y), 12, '#FFD23F');
    drawLabel(ctx, mid(x), mid(y) + 4, String(i + 1));
  });

  level.enemies.forEach((enemy) => {
    const cx = mid(enemy.x);
    const cy = mid(enemy.row) + (enemy.type === 'whitefly' ? 10 : 6);
    const look = enemy.skin === 'folharao' ? ['#8CC63F', 'F'] : enemy.skin === 'casca' ? ['#C8643A', 'C'] : enemy.type === 'whitefly' ? ['#F8F1D4', 'M'] : ['#8A4E28', 'B'];
    drawDot(ctx, cx, cy, 12, look[0]);
    drawLabel(ctx, cx, cy + 4, look[1]);
  });
}

export default function EditorCanvas({ level, onPaint }) {
  const canvasRef = useRef(null);
  const painting = useRef(false);
  const [hover, setHover] = useState(null);

  const width = level.rows[0].length;
  const W = width * TILE;
  const H = ROWS * TILE;
  const theme = themeFor(level.preset);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintScene(ctx, level, theme);
  }, [level, theme, W, H]);

  const cellFromEvent = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor(((event.clientX - rect.left) / rect.width) * width);
    const y = Math.floor(((event.clientY - rect.top) / rect.height) * ROWS);
    return { x, y };
  };

  const handleDown = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    painting.current = true;
    const cell = cellFromEvent(event);
    setHover(cell);
    onPaint(cell.x, cell.y);
  };

  const handleMove = (event) => {
    const cell = cellFromEvent(event);
    setHover(cell);
    if (painting.current) onPaint(cell.x, cell.y);
  };

  const stop = () => {
    painting.current = false;
  };

  return (
    <div className="relative" style={{ width: W, height: H }}>
      <canvas
        ref={canvasRef}
        style={{ width: W, height: H }}
        className="block cursor-crosshair touch-none"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={() => {
          stop();
          setHover(null);
        }}
      />
      {hover && hover.x >= 0 && hover.x < width && hover.y >= 0 && hover.y < ROWS && (
        <div
          className="pointer-events-none absolute border-[3px] border-[#FFD23F]"
          style={{ left: hover.x * TILE, top: hover.y * TILE, width: TILE, height: TILE }}
        />
      )}
    </div>
  );
}
import { motion } from 'framer-motion';
import { Pause } from 'lucide-react';
import { PixelGoldenBoll, HudImg, HudHeart } from '@/components/game/hud/HudIcons';
import StatChip from '@/components/game/hud/StatChip';

const ICON = 'h-8 w-8 sm:h-10 sm:w-10';
const Divider = () => <span className="mx-1 hidden h-8 w-[2px] rounded bg-[#C9AE7E] sm:block" aria-hidden="true" />;

// botão de pausa (no celular não há Esc nem Start)
function PauseButton({ onClick }) {
  if (!onClick) return null;
  return (
    <motion.button
      type="button"
      aria-label="Pausar"
      onClick={onClick}
      whileTap={{ scale: 0.88, y: 2 }}
      whileHover={{ y: -1 }}
      className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#7A4A1E] bg-[#FFD23F] text-[#3A2A0E] shadow-[0_2px_0_rgba(80,40,10,0.35)] sm:h-11 sm:w-11"
    >
      <Pause className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
    </motion.button>
  );
}

function RoundButton({ label, onClick, img, dim = false }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.88, y: 2 }}
      whileHover={{ y: -1 }}
      className={`flex h-9 w-9 items-center justify-center sm:h-11 sm:w-11 ${dim ? 'opacity-50 grayscale' : ''}`}
    >
      <HudImg name={img} className="h-full w-full drop-shadow-[0_2px_0_rgba(80,40,10,0.35)]" />
    </motion.button>
  );
}

export default function GameHud({ level, hud, soundOn, onToggleSound, onExit, onPause, compact = false }) {

  if (compact) {
    const C = 'h-6 w-6';
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-1.5 px-2 pt-1.5">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border-2 border-[#7A4A1E] bg-[#FFF8E6]/90 px-2.5 py-0.5 text-[13px] font-extrabold text-[#3A2A0E]">
          <span className="flex items-center gap-1"><HudHeart className={C} />{hud.lives}/5</span>
          <span className="flex items-center gap-1"><HudImg name="boll" className={C} />{hud.collected}</span>
          <span className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-[#8A6A43]">Pontos<span className="text-[13px] normal-case tracking-normal text-[#3A2A0E]">{hud.score}</span></span>
          {hud.power > 0 && <span className="flex items-center gap-1"><PixelGoldenBoll className={C} />{Math.ceil(hud.power / 60)}s</span>}
        </div>
        <div className="pointer-events-auto ml-auto flex items-center gap-1">
          <PauseButton onClick={onPause} />
          <RoundButton label={soundOn ? 'Desligar som' : 'Ligar som'} onClick={onToggleSound} img="sound" dim={!soundOn} />
          <RoundButton label="Voltar ao menu" onClick={onExit} img="exit" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
      className="rounded-[22px] border-[3px] border-[#7A4A1E] bg-gradient-to-b from-[#FFF8E6] to-[#F6E7C4] px-2 py-2 shadow-[0_4px_0_#5A3412,0_14px_24px_-14px_rgba(60,30,10,0.6)] sm:rounded-[30px] sm:px-4 sm:py-2.5"
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
        <StatChip tone="life" title="Vidas" pulse={hud.lives <= 1} icon={<HudHeart className={ICON} />} value={`${hud.lives}/5`} />
        <StatChip tone="boll" title="Capulhos coletados" icon={<HudImg name="boll" className={ICON} />} value={hud.collected} />
        {hud.power > 0 && (
          <StatChip tone="power" title="Poder do capulho dourado" pulse icon={<PixelGoldenBoll className={ICON} />} value={`${Math.ceil(hud.power / 60)}s`} />
        )}

        <Divider />

        <StatChip tone="score" title="Pontos" icon={<span className="px-1 font-display text-[11px] font-extrabold uppercase text-[#8A6A43]">Pts</span>} value={hud.score} />

        <div className="ml-auto flex items-center gap-2">
          <Divider />
          <PauseButton onClick={onPause} />
          <RoundButton label={soundOn ? 'Desligar som' : 'Ligar som'} onClick={onToggleSound} img="sound" dim={!soundOn} />
          <RoundButton label="Voltar ao menu" onClick={onExit} img="exit" />
        </div>
      </div>
    </motion.div>
  );
}
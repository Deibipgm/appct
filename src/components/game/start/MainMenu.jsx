import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Map, Trophy, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { LEVELS } from '@/game/levels';

const ITEM =
  'flex w-full items-center gap-3 rounded-[14px] border-2 border-[#6e4f2c] bg-[#fffaf0] px-4 py-2.5 text-sm font-extrabold text-[#3a2a0e] shadow-[0_4px_0_#8a6a43] transition hover:bg-white active:translate-y-[3px] active:shadow-none sm:py-3 sm:text-base';

function Item({ icon: Icon, label, hint, ...props }) {
  const content = (
    <>
      <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#e3f2cf] text-[#3b6e2c]">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-left">{label}</span>
      {hint && <span className="text-[11px] font-bold text-[#9a8660]">{hint}</span>}
    </>
  );
  return props.to ? (
    <Link className={ITEM} {...props}>{content}</Link>
  ) : (
    <button type="button" className={ITEM} {...props}>{content}</button>
  );
}

export default function MainMenu({ onStart, onSelectLevel, onRanking, soundOn, onToggleSound }) {
  const [phases, setPhases] = useState(false);

  if (phases) {
    return (
      <nav className="flex w-full flex-col gap-3" aria-label="Escolher fase">
        {LEVELS.map((level, i) => (
          <Item key={level.id} icon={Play} label={level.name} hint={level.tag} onClick={() => onSelectLevel?.(i)} />
        ))}
        <Item icon={ArrowLeft} label="Voltar" onClick={() => setPhases(false)} />
      </nav>
    );
  }

  return (
    <nav className="flex w-full flex-col gap-3" aria-label="Menu principal">
      <motion.button
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-3 rounded-[16px] bg-[#3f9a3c] px-6 py-3.5 text-lg font-extrabold text-[#fffbe8] shadow-[0_6px_0_#2b6e2a] transition hover:bg-[#46a843] active:shadow-[0_2px_0_#2b6e2a] sm:py-4 sm:text-xl"
      >
        <Play className="h-5 w-5 fill-current" strokeWidth={0} />
        Começar a aventura
      </motion.button>
      <Item icon={Map} label="Escolher fase" hint={`${LEVELS.length} fases`} onClick={() => setPhases(true)} />
      <Item icon={Trophy} label="Ranking" hint="top 10" onClick={onRanking} />
      <Item
        icon={soundOn ? Volume2 : VolumeX}
        label={soundOn ? 'Som ligado' : 'Som desligado'}
        onClick={onToggleSound}
      />
    </nav>
  );
}
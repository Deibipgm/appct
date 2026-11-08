import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { loadRanking } from '@/game/ranking';
import { motion } from 'framer-motion';
import MainMenu from '@/components/game/start/MainMenu';
import HeroLogo from '@/components/game/start/HeroLogo';
import { ART } from '@/game/sprites';
import { Image } from '@/components/ui/image';

const HERO_BG = ART.telaPrincipal;
const ABAPA_LOGO = ART.logoAbapa;
const AGRO_LOGO = ART.logoAgro;

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay },
});

const KBD = 'whitespace-nowrap rounded-lg border-2 border-b-4 border-[#b8a67c] bg-[#fffaf0] px-2.5 py-1 text-[11px] font-bold';

// Altura natural do bloco (logo + menu): reduz o bloco para caber na tela sem rolagem.
const NATURAL_H = 880;
const useFit = () => {
  const [k, setK] = useState(1);
  useEffect(() => {
    const calc = () => setK(Math.max(0.5, Math.min(1, (window.innerHeight - 170) / NATURAL_H)));
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return k;
};

// Modo feira: os 5 melhores de hoje ficam à mostra no menu para puxar a competição.
function TodayTop() {
  const list = loadRanking().slice(0, 5);
  return (
    <motion.aside
      {...rise(0.3)}
      className="pointer-events-none absolute bottom-16 left-4 z-10 hidden w-[300px] rounded-[22px] border-[3px] border-[#6e4f2c] bg-[#fffaf0]/90 p-4 shadow-[0_6px_0_#8a6a43] backdrop-blur-[3px] md:block"
    >
      <p className="flex items-center gap-2 font-display text-lg font-black text-[#3a2a0e]">
        <Trophy className="h-5 w-5 text-[#c8901a]" /> Ranking de hoje
      </p>
      {list.length === 0 ? (
        <p className="mt-2 text-sm font-bold text-[#6b5d3e]">Ninguém ainda. Seja o primeiro!</p>
      ) : (
        <ol className="mt-2 space-y-1">
          {list.map((r, i) => (
            <li key={r.date} className="flex items-center gap-2 text-sm font-extrabold text-[#3a2a0e]">
              <span className="w-5 text-right text-[#9a8660]">{i + 1}.</span>
              <span className="min-w-0 flex-1 truncate">{r.name}</span>
              <span className="tabular-nums">{r.score}</span>
            </li>
          ))}
        </ol>
      )}
    </motion.aside>
  );
}

export default function StartScreen({ onStart, onSelectLevel, onRanking, soundOn, onToggleSound, feira = false, onToggleFeira }) {
  const fit = useFit();
  // 5 toques seguidos no rodapé ligam/desligam o modo feira (escondido do visitante)
  const taps = useRef({ n: 0, t: 0 });
  const [notice, setNotice] = useState('');
  const tapFooter = () => {
    const now = Date.now();
    taps.current = { n: now - taps.current.t < 700 ? taps.current.n + 1 : 1, t: now };
    if (taps.current.n >= 5) {
      taps.current.n = 0;
      onToggleFeira?.();
      setNotice(feira ? 'Modo feira desligado' : 'Modo feira ligado');
      setTimeout(() => setNotice(''), 2500);
    }
  };
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col overflow-x-hidden text-[#2c3a22]"
      style={{
        background: '#bfe3f5',
        fontFamily: '"Trebuchet MS","Segoe UI",system-ui,sans-serif',
      }}
    >
      <Image src={HERO_BG} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg,rgba(20,40,60,0.16) 0,rgba(20,40,60,0.04) 30%,rgba(246,240,220,0) 80%,rgba(246,240,220,0.35) 100%)' }}
      />

      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-[1180px] flex-1 flex-col px-4 pt-3 md:px-6 md:pt-5">
        <motion.header
          {...rise(0)}
          className="mx-auto flex w-fit max-w-full flex-col items-center gap-1 rounded-[18px] bg-white/85 px-6 py-2 shadow-[0_18px_40px_-22px_rgba(30,40,20,0.6)] backdrop-blur-sm sm:px-8"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[#5b6b78]">Realização</span>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <img src={ABAPA_LOGO} alt="ABAPA" className="h-[30px] w-auto sm:h-[48px]" />
            <span className="h-[26px] w-[2px] rounded bg-[#c9d3dc] sm:h-[40px]" aria-hidden="true" />
            <img src={AGRO_LOGO} alt="Conhecendo o Agro" className="h-[30px] w-auto sm:h-[48px]" />
          </div>
        </motion.header>

        <div className="flex min-h-0 flex-1 items-end justify-center sm:justify-end">
          <motion.div
            {...rise(0.15)}
            className="w-full max-w-[400px] text-center"
            style={{ zoom: fit }}
          >
            <h1 className="sr-only">Super Dão: A Grande Aventura do Algodão</h1>
            <HeroLogo className="mx-auto -mb-3 h-[240px] w-auto sm:h-[340px]" />
            <div className="rounded-[24px] border-[3px] border-[#6e4f2c] bg-[#fffaf0]/85 p-5 shadow-[0_8px_0_#8a6a43,0_30px_50px_-24px_rgba(60,50,20,0.5)] backdrop-blur-[3px] sm:p-7">
            <MainMenu
              onStart={onStart}
              onSelectLevel={onSelectLevel}
              onRanking={onRanking}
              soundOn={soundOn}
              onToggleSound={onToggleSound}
            />
            <div className="mt-5 hidden justify-center gap-x-4 text-[11px] font-bold text-[#6b5d3e] sm:flex">
              <span className="flex items-center gap-1.5"><kbd className={KBD}>← →</kbd> mover</span>
              <span className="flex items-center gap-1.5"><kbd className={KBD}>espaço</kbd> pular</span>
              <span className="flex items-center gap-1.5"><kbd className={KBD}>J</kbd> soco</span>
              <span className="flex items-center gap-1.5"><kbd className={KBD}>K</kbd> algodão</span>
            </div>
            </div>
          </motion.div>
        </div>
      </div>

      {feira && <TodayTop />}
      {notice && (
        <div role="status" className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-[3px] border-[#1B120C] bg-[#FFD23F] px-6 py-3 font-display text-xl font-black text-[#1B120C] shadow-[0_5px_0_#1B120C]">
          {notice}
        </div>
      )}
      <footer
        data-pad-skip
        onClick={tapFooter}
        className="relative z-10 mx-auto my-1.5 w-fit shrink-0 cursor-default rounded-full bg-white/75 px-4 py-1 text-center text-xs font-bold text-[#5b4a2e]"
      >
        Desenvolvido por Deibi Soares{feira && <span className="ml-2 rounded-full bg-[#3f9a3c] px-2 py-0.5 text-[10px] text-white">MODO FEIRA</span>}
      </footer>
    </div>
  );
}
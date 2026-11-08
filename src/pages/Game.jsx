import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '@/game/levels';
import { sfx, unlockAudio } from '@/game/audio';
import { startAmbience, stopAmbience } from '@/game/ambience';
import { startMusic, stopMusic } from '@/game/music';
import GameCanvas from '@/components/game/GameCanvas';
import GameHud from '@/components/game/GameHud';
import TouchControls from '@/components/game/TouchControls';
import StartScreen from '@/components/game/StartScreen';
import ResultScreen from '@/components/game/ResultScreen';
import GameOverOverlay from '@/components/game/GameOverOverlay';
import RankingScreen from '@/components/game/RankingScreen';
import { addToRanking } from '@/game/ranking';
import { isFeira, setFeira, enterFullscreen, exitFullscreen, DEMO_AFTER, BACK_TO_MENU_AFTER, DEMO_LENGTH } from '@/game/feira';
import { createDemoBot } from '@/game/demoBot';
import { createFlightBot } from '@/game/flightBot';
import PhaseIntro from '@/components/game/PhaseIntro';
import FactCard from '@/components/game/FactCard';
import GamepadBridge from '@/components/game/GamepadBridge';
import PauseOverlay from '@/components/game/PauseOverlay';

const TOTAL_BOLLS = LEVELS.reduce((sum, l) => sum + (l.bolls?.length ?? 0), 0);

// Celular deitado: jogo em tela cheia, HUD enxuto em cima e botões flutuando nos cantos.
function useLandscapePhone() {
  const calc = () =>
    typeof window !== 'undefined' &&
    !!window.matchMedia?.('(pointer: coarse)').matches &&
    window.innerWidth > window.innerHeight &&
    window.innerHeight < 640;
  const [v, setV] = useState(calc);
  useEffect(() => {
    const on = () => setV(calc());
    window.addEventListener('resize', on);
    window.addEventListener('orientationchange', on);
    return () => {
      window.removeEventListener('resize', on);
      window.removeEventListener('orientationchange', on);
    };
  }, []);
  return v;
}

export default function Game() {
  const landscapePhone = useLandscapePhone();

  // Celular: segurar o dedo não pode abrir "Copiar / Selecionar tudo" nem o menu do navegador.
  useEffect(() => {
    const stop = (e) => {
      if (e.target?.closest?.('input, textarea')) return;
      e.preventDefault();
    };
    document.addEventListener('selectstart', stop);
    document.addEventListener('contextmenu', stop);
    return () => {
      document.removeEventListener('selectstart', stop);
      document.removeEventListener('contextmenu', stop);
    };
  }, []);
  const [phase, setPhase] = useState('menu');
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [feira, setFeiraOn] = useState(isFeira);
  const toggleFeira = useCallback(() => {
    setFeiraOn((on) => {
      setFeira(!on);
      if (!on) enterFullscreen();
      else exitFullscreen();
      return !on;
    });
  }, []);
  const [levelIndex, setLevelIndex] = useState(0);
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState({ score: 0, collected: 0, lives: 5, progress: 0 });
  const [result, setResult] = useState({ score: 0, collected: 0, correct: 0 });
  const [soundOn, setSoundOn] = useState(true);
  const [activeFact, setActiveFact] = useState(null);
  const [seals, setSeals] = useState([]);
  const [learned, setLearned] = useState([]);
  const [rankPos, setRankPos] = useState(0);

  const engineRef = useRef(null);
  const livesRef = useRef(5);
  const soundRef = useRef(true);
  const soloRef = useRef(false);

  const level = LEVELS[levelIndex];

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // app em segundo plano (tela apagada, outro app): pausa o jogo e cala música e ambiente
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const inLevel = (phase === 'playing' || phase === 'fact' || phase === 'quiz') && !hidden;
  useEffect(() => {
    if (soundOn && inLevel) startAmbience(level.id);
    else stopAmbience();
    return stopAmbience;
  }, [soundOn, inLevel, level.id, runId]);

  // música de fundo: só durante a fase (depois do "Começar"), pausa no menu, na apresentação e em fim de jogo
  useEffect(() => {
    if (soundOn && inLevel) startMusic(level.id);
    else stopMusic();
    return () => stopMusic(true);
  }, [soundOn, inLevel, level.id, runId]);

  const onSound = useCallback((name) => {
    if (soundRef.current && phaseRef.current !== 'demo') sfx[name]?.();
  }, []);
  const onHud = useCallback((h) => setHud(h), []);
  // na demonstração, vencer ou perder só encerra a demonstração
  const onWin = useCallback(() => setPhase((p) => (p === 'demo' ? 'menu' : 'quiz')), []);
  const onGameOver = useCallback(() => setPhase((p) => (p === 'demo' ? 'menu' : 'over')), []);
  const onFact = useCallback((fact) => {
    if (phaseRef.current === 'demo') return;
    setActiveFact(fact);
    setLearned((l) => (l.some((x) => x.title === fact.title) ? l : [...l, { title: fact.title, text: fact.text }]));
    setPhase('fact');
  }, []);
  const closeFact = useCallback(() => {
    if (engineRef.current) engineRef.current.hold = false;
    setActiveFact(null);
    setPhase('playing');
  }, []);

  const startRun = (startIndex, solo) => {
    unlockAudio();
    soloRef.current = solo;
    livesRef.current = 5;
    setResult({ score: 0, collected: 0, correct: 0 });
    setLevelIndex(startIndex);
    setRunId((r) => r + 1);
    setSeals([]);
    setLearned([]);
    setHud({ score: 0, collected: 0, lives: 5, progress: 0 });
    setPhase('intro');
  };
  const startGame = () => startRun(0, false);
  const startPhase = (index) => startRun(index, true);

  const handleQuizNext = (correct) => {
    const engine = engineRef.current;
    const levelScore = (engine?.score ?? 0) + (correct ? 100 : 0);
    const levelBolls = engine?.collected ?? 0;
    livesRef.current = 5;
    setResult((prev) => ({
      score: prev.score + levelScore,
      collected: prev.collected + levelBolls,
      correct: prev.correct + (correct ? 1 : 0),
    }));
    setSeals((prev) =>
      prev.some((s) => s.id === level.id) ? prev : [...prev, { id: level.id, name: level.seal }]
    );
    if (soloRef.current || levelIndex + 1 >= LEVELS.length) {
      setPhase(soloRef.current ? 'menu' : 'result');
      return;
    }
    setLevelIndex((i) => i + 1);
    setRunId((r) => r + 1);
    setHud({
      score: 0,
      collected: 0,
      lives: livesRef.current,
      progress: 0,
    });
    setPhase('intro');
  };

  // pausa (Start do controle, Esc ou P no teclado)
  const setPaused = useCallback((on) => {
    setPhase((p) => (on && p === 'playing' ? 'paused' : !on && p === 'paused' ? 'playing' : p));
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape' && e.code !== 'KeyP') return;
      if (e.target?.closest?.('input, textarea')) return;
      setPhase((p) => (p === 'playing' ? 'paused' : p === 'paused' ? 'playing' : p));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  // ---------- modo feira ----------
  const lastActRef = useRef(performance.now());
  const demoStartRef = useRef(0);
  const demoExitRef = useRef(0);
  const markActivity = useCallback(() => {
    lastActRef.current = performance.now();
    // alguém mexeu durante a demonstração: volta ao menu para jogar
    if (phaseRef.current === 'demo') {
      demoExitRef.current = performance.now();
      setPhase('menu');
    }
  }, []);
  const startDemo = useCallback(() => {
    demoStartRef.current = performance.now();
    livesRef.current = 5;
    setLevelIndex((i) => {
      let n = Math.floor(Math.random() * LEVELS.length);
      if (n === i && LEVELS.length > 1) n = (n + 1) % LEVELS.length;
      return n;
    });
    setRunId((r) => r + 1);
    setActiveFact(null);
    setPhase('demo');
  }, []);
  useEffect(() => {
    const onAct = (e) => {
      if (e.type === 'keydown' && e.ctrlKey && e.shiftKey && e.code === 'KeyF') {
        e.preventDefault();
        toggleFeira();
      }
      if (phaseRef.current === 'demo') {
        e.preventDefault();
        e.stopPropagation();
      }
      markActivity();
    };
    // o toque que acorda a demonstração não pode apertar um botão do menu que aparece embaixo
    const onClick = (e) => {
      if (performance.now() - demoExitRef.current < 600) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onAct, true);
    window.addEventListener('pointerdown', onAct, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('click', onClick, true);
      window.removeEventListener('keydown', onAct, true);
      window.removeEventListener('pointerdown', onAct, true);
    };
  }, [markActivity, toggleFeira]);
  useEffect(() => {
    if (!feira) {
      if (phaseRef.current === 'demo') setPhase('menu');
      return undefined;
    }
    lastActRef.current = performance.now();
    const id = setInterval(() => {
      if (document.hidden) return;
      const idle = (performance.now() - lastActRef.current) / 1000;
      const ph = phaseRef.current;
      if (ph === 'menu') {
        if (idle > DEMO_AFTER) startDemo();
      } else if (ph === 'demo') {
        // acabou o tempo ou o piloto travou (corda, por exemplo): troca de fase
        const stalled = (autopilotRef.current?.stalled ?? 0) > 60 * 8;
        if (stalled || (performance.now() - demoStartRef.current) / 1000 > DEMO_LENGTH) startDemo();
      } else if (idle > BACK_TO_MENU_AFTER) {
        // o visitante foi embora: deixa o jogo pronto para o próximo
        lastActRef.current = performance.now();
        setPhase('menu');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [feira, startDemo]);
  const autopilot = useMemo(() => (phase === 'demo' ? (level.flight ? createFlightBot() : createDemoBot()) : null), [phase, runId, level.flight]);
  const autopilotRef = useRef(null);
  autopilotRef.current = autopilot;
  const saveAfterGameOver = () => {
    const engine = engineRef.current;
    setResult((prev) => ({
      score: prev.score + (engine?.score ?? hud.score),
      collected: prev.collected + (engine?.collected ?? hud.collected),
      correct: prev.correct,
    }));
    setPhase('result-over');
  };

  const pad = <GamepadBridge engineRef={engineRef} phase={phase} onPause={setPaused} onActivity={markActivity} />;

  // sem quiz: ao terminar a animação de final de fase, segue direto
  useEffect(() => {
    if (phase === 'quiz') handleQuizNext(false);
  }, [phase]);

  if (phase === 'menu') {
    return (
      <>
      {pad}
      <StartScreen
        onStart={startGame}
        onSelectLevel={startPhase}
        onRanking={() => { setRankPos(0); setPhase('ranking'); }}
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((s) => !s)}
        feira={feira}
        onToggleFeira={toggleFeira}
      />
      </>
    );
  }

  if (phase === 'result' || phase === 'result-over') {
    return (
      <>
      {pad}
      <ResultScreen
        learned={learned}
        score={result.score}
        gameOver={phase === 'result-over'}
        feira={feira}
        onSave={(name) => {
          const { position } = addToRanking({ name, score: result.score, collected: result.collected, learned: learned.length });
          setRankPos(position);
          setPhase('ranking');
        }}
        onRestart={startGame}
        onMenu={() => setPhase('menu')}
      />
      </>
    );
  }

  if (phase === 'ranking') {
    return (
      <>
      {pad}
      <RankingScreen highlight={rankPos} feira={feira} onMenu={() => setPhase('menu')} onRestart={rankPos ? startGame : undefined} />
      </>
    );
  }

  return (
    <>
    {pad}
    <div
      className={
        landscapePhone
          ? 'fixed inset-0 overflow-hidden bg-[#10201A]'
          : 'flex min-h-[100dvh] flex-col overflow-x-hidden px-2 py-2 sm:min-h-screen sm:block sm:px-6 sm:py-6'
      }
      style={{ background: 'linear-gradient(180deg,#CFF6FF 0,#EAF6E2 380px,#F4EEDC 100%)' }}
    >
      <div
        className={landscapePhone ? 'absolute inset-0' : 'mx-auto flex w-full flex-1 flex-col sm:block'}
        // a tela do jogo cresce até caber na altura da janela (HUD em cima e dica embaixo inclusos)
        style={landscapePhone ? undefined : { maxWidth: 'max(min(100%, 1024px), min(100%, calc((100vh - 190px) * 960 / 528)))' }}
      >
        <GameHud
          level={level}
          hud={hud}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn((s) => !s)}
          onExit={() => setPhase('menu')}
          onPause={() => setPaused(true)}
          compact={landscapePhone}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className={landscapePhone ? 'absolute inset-0 flex items-center justify-center bg-[#10201A]' : "relative mt-2 flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-[18px] border-[3px] border-[#1B120C] bg-[#BFE3F5] shadow-[0_5px_0_#1B120C,0_28px_60px_-30px_rgba(40,60,40,0.55)] sm:mt-3 sm:block sm:flex-none sm:rounded-[26px] sm:shadow-[0_7px_0_#1B120C,0_28px_60px_-30px_rgba(40,60,40,0.55)]"}
        >
          <GameCanvas
            key={`${level.id}-${runId}`}
            levelDef={level}
            lives={livesRef.current}
            paused={(phase !== 'playing' && phase !== 'demo') || hidden}
            onHud={onHud}
            onWin={onWin}
            onGameOver={onGameOver}
            onSound={onSound}
            onFact={onFact}
            engineRef={engineRef}
            fit={landscapePhone}
            autopilot={autopilot}
          />


          {phase === 'intro' && <PhaseIntro level={level} onStart={() => { unlockAudio(); setPhase('playing'); }} />}
          {phase === 'demo' && (
            <div className="pointer-events-none absolute inset-x-0 bottom-[12%] z-20 flex justify-center px-4">
              <div className="animate-pulse rounded-2xl border-[3px] border-[#1B120C] bg-[#FFD23F] px-5 py-2 text-center font-display text-lg font-black text-[#1B120C] shadow-[0_5px_0_#1B120C] sm:text-2xl">
                Demonstração · aperte qualquer botão para jogar!
              </div>
            </div>
          )}
          {phase === 'paused' && <PauseOverlay onResume={() => setPaused(false)} onMenu={() => setPhase('menu')} />}
          {phase === 'fact' && <FactCard fact={activeFact} onClose={closeFact} />}

          {phase === 'over' && (
            <GameOverOverlay
              score={hud.score}
              collected={hud.collected}
              onRestart={() => startRun(levelIndex, soloRef.current)}
              onMenu={() => setPhase('menu')}
              onRanking={feira ? saveAfterGameOver : undefined}
            />
          )}
        </motion.div>

        <TouchControls engineRef={engineRef} overlay={landscapePhone} flight={!!level.flight} />

        <p className="mt-3 hidden text-center text-xs font-semibold text-[#8A8674] md:block">
          {level.flight
            ? `${level.tip} · Setas ou W/A/S/D pilotam · J, X ou K soltam o jato de algodão (segure para rajada) · Esc pausa · também dá para jogar com controle USB`
            : `${level.tip} · Setas ou A/D para andar · Espaço para pular · J ou X para dar soco · Esc pausa · também dá para jogar com controle USB`}
        </p>
      </div>
    </div>
    </>
  );
}
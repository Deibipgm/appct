import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Hand, Circle, Play, Skull, Wind, Droplets } from 'lucide-react';
import { ART_BASE } from '@/game/sprites';
import { ENEMY_KINDS, PHASE_ROSTER } from '@/game/roster';
import { BOSSES } from '@/game/boss';
import { listPads } from '@/game/gamepad';

// Imagem de cada inimigo (artes que já estão no jogo).
const IMG = {
  weevil: 'bicudo.png',
  whitefly: 'mosca.png',
  cochonilha: 'cochonilha.png',
  folharao: 'folharao.png',
  casca: 'casca.png',
  sintetico: 'sintetico.png',
  fumagina: 'fumagina.png',
  graxolino: 'graxolino.png',
  plastico: 'plastico.png',
  microbio: 'microbio.png',
  aereoMosca: 'mosca.png',
  mariposa: 'mariposa.png',
  aereoBicudo: 'bicudo.png',
  percevejo: 'percevejo.png',
  tempestade: 'aereo-tempestade.png',
};
const BOSS_IMG = { bicudo: 'bicudo.png', faisca: 'faisca.png', relogio: 'relogio-chefe.png', traca: 'traca.png', enxame: 'mosca.png', bicudao: 'bicudo.png' };
const BOSS_ROLE = {
  bicudo: 'Investe, pula e cospe. Pise na cabeça dele ou use o soco quando ele parar.',
  faisca: 'Lança faíscas e dá saltos. Espere o ataque acabar para golpear.',
  relogio: 'Faz ondas de alarme que deixam o Dão lento. Golpeie entre as ondas.',
  traca: 'Voa roendo fios e cospe poeira. Acerte quando ela descer.',
  enxame: 'Nuvem de moscas-brancas: solta mais moscas a cada golpe.',
  bicudao: 'Escondido nos restos da lavoura: soque os montes para achá-lo, depois pise na cabeça dele.',
};

const CONTROLS = [
  { icon: <><ArrowLeft className="h-5 w-5" /><ArrowRight className="h-5 w-5" /></>, bg: '#FFFDF7', name: 'Andar', what: 'Segure para ir e voltar', keys: 'Setas ou A / D', pad: 'D-pad' },
  { icon: <ArrowUp className="h-6 w-6 text-white" />, bg: '#F0273A', name: 'Pular', what: 'Segure para pular mais alto. Pise nos inimigos', keys: 'Espaço, ↑ ou W', pad: 'B' },
  { icon: <Hand className="h-5 w-5" />, bg: '#FFD23F', name: 'Soco', what: 'Derrota inimigos e quebra paredes secretas', keys: 'J, X ou F', pad: 'Y' },
  { icon: <Circle className="h-5 w-5 fill-white" />, bg: '#FFFDF7', name: 'Algodão', what: 'Arremessa um capulho à distância', keys: 'K ou C', pad: 'A' },
];

// Fase 6: comandos do avião
const FLIGHT_CONTROLS = [
  { icon: <><ArrowUp className="h-4 w-4" /><ArrowDown className="h-4 w-4" /></>, bg: '#FFFDF7', name: 'Pilotar', what: 'Sobe, desce, acelera e freia o avião', keys: 'Setas ou W A S D', pad: 'D-pad' },
  { icon: <Wind className="h-5 w-5 text-white" />, bg: '#F0273A', name: 'Jato de algodão', what: 'Segure para soltar uma rajada nas pragas', keys: 'J, X ou F', pad: 'Y' },
  { icon: <Droplets className="h-5 w-5" />, bg: '#BFE8FF', name: 'Pulverizar', what: 'A gotinha azul enche o tanque. Segure e voe BAIXO sobre a lavoura: alto demais o vento leva a calda (deriva)', keys: 'K ou C', pad: 'A' },
];

function Pic({ src, size = 64 }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl border-[3px] border-[#1B120C] bg-[#FFF3C4] shadow-[0_3px_0_#1B120C]"
      style={{ width: size, height: size }}
    >
      <img src={`${ART_BASE}${src}`} alt="" draggable={false} className="max-h-[85%] max-w-[85%] select-none object-contain" />
    </div>
  );
}

export default function PhaseIntro({ level, onStart }) {
  const roster = (PHASE_ROSTER[level.id] ?? []).map((k) => ENEMY_KINDS[k] && { key: k, ...ENEMY_KINDS[k] }).filter(Boolean);
  const boss = BOSSES[level.boss] ?? level.bossInfo;
  const bossImg = BOSS_IMG[level.boss] ?? level.bossInfo?.img;
  const bossRole = BOSS_ROLE[level.boss] ?? level.bossInfo?.role;
  const controls = level.flight ? FLIGHT_CONTROLS : CONTROLS;
  const hasPad = listPads().length > 0;
  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-b from-[#FFF3C4] to-[#FFD9A0] p-3 sm:p-6 [@media(max-height:500px)]:p-2">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-3 [@media(max-height:500px)]:gap-1.5">
        <div className="text-center">
          <span className="inline-block rounded-full border-2 border-[#1B120C] bg-[#FFD23F] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em]">
            {level.tag ?? 'Nova fase'}
          </span>
          <h2 className="font-display mt-1 text-xl font-black leading-tight text-[#1B120C] sm:text-3xl [@media(max-height:500px)]:mt-0 [@media(max-height:500px)]:text-lg">{level.name}</h2>
          <p className="mx-auto mt-1 max-w-xl text-xs font-semibold text-[#5B4A2E] sm:text-sm [@media(max-height:500px)]:hidden">{level.mission}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 [@media(max-height:500px)]:grid-cols-2 [@media(max-height:500px)]:gap-2">
          <section className="rounded-[20px] border-[3px] border-[#1B120C] bg-[#FFFDF7] p-3 [@media(max-height:500px)]:p-1.5 shadow-[0_4px_0_#1B120C]">
            <h3 className="font-display mb-2 flex items-center gap-1.5 text-sm font-black uppercase tracking-wide text-[#8E2B1E]">
              <Skull className="h-4 w-4" /> Quem você vai enfrentar
            </h3>
            <ul className="space-y-2 [@media(max-height:500px)]:space-y-1">
              {roster.map((e) => (
                <li key={e.key} className="flex items-center gap-2.5">
                  <Pic src={IMG[e.key] ?? 'bicudo.png'} size={44} />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold leading-tight text-[#1B120C]">{e.label}</p>
                    <p className="text-[11px] font-semibold leading-snug text-[#5B5648]">{e.role}</p>
                  </div>
                </li>
              ))}
              {boss && (
                <li className="flex items-center gap-2.5 rounded-2xl bg-[#FFE1DC] p-1.5">
                  <Pic src={bossImg} size={50} />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold leading-tight text-[#8E2B1E]">
                      Chefão: {boss.name.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-[11px] font-semibold leading-snug text-[#5B5648]">{bossRole}</p>
                  </div>
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-[20px] border-[3px] border-[#1B120C] bg-[#FFFDF7] p-3 [@media(max-height:500px)]:p-1.5 shadow-[0_4px_0_#1B120C]">
            <h3 className="font-display mb-2 text-sm font-black uppercase tracking-wide text-[#0072BC]">Comandos</h3>
            <ul className="space-y-2 [@media(max-height:500px)]:space-y-1">
              {controls.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5">
                  <div
                    className="flex h-11 min-w-[44px] [@media(max-height:500px)]:h-8 [@media(max-height:500px)]:min-w-[34px] shrink-0 items-center justify-center rounded-full border-[3px] border-[#1B120C] px-1.5 shadow-[0_3px_0_#1B120C]"
                    style={{ background: c.bg }}
                  >
                    {c.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-sm font-extrabold leading-tight text-[#1B120C]">
                      {c.name} <span className="ml-1 rounded-md bg-[#EFE6CF] px-1.5 py-0.5 text-[10px] font-bold text-[#5B4A2E]">{c.keys}</span>
                      {hasPad && <span className="ml-1 rounded-md bg-[#1B120C] px-1.5 py-0.5 text-[10px] font-bold text-[#FFE89A]">🎮 {c.pad}</span>}
                    </p>
                    <p className="text-[11px] font-semibold leading-snug text-[#5B5648]">{c.what}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="sticky bottom-0 mx-auto flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#1B120C] bg-[#3DBE4F] px-8 py-3 [@media(max-height:500px)]:py-1.5 font-display text-lg font-extrabold text-white shadow-[0_5px_0_#1B120C] transition active:translate-y-[3px] active:shadow-none"
        >
          <Play className="h-5 w-5 fill-white" />
          Começar
        </button>
      </div>
    </div>
  );
}

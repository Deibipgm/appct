import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ReferenceCard from '@/components/references/ReferenceCard';
import EffectsConcept from '@/components/references/EffectsConcept';
import StudyPanel from '@/components/references/StudyPanel';

const STYLES = [
  {
    id: 'wonder',
    label: 'Wonder Saturado',
    subtitle: 'Formas gordas, contorno grosso e cor no talo.',
    image:
      'https://media.base44.com/images/public/6aea33b7e062d7bfa620ba38/af54a3c2c_generated_image.png',
    adopted: true,
    notes: [
      'Todo elemento com contorno escuro grosso e cantos arredondados.',
      'Sombra curta e chapada no lugar de degradê.',
      'Personagem com olhos grandes, legível mesmo pequeno.',
    ],
    reference: {
      game: 'Super Mario Bros. Wonder',
      studio: 'Nintendo, 2023',
      url: 'https://www.nintendo.com/us/store/products/super-mario-bros-wonder-switch/',
    },
  },
  {
    id: 'craft',
    label: 'Artesanal de Papel',
    subtitle: 'Cenário montado à mão, com feltro e algodão real.',
    image:
      'https://media.base44.com/images/public/6aea33b7e062d7bfa620ba38/6346aa75a_generated_image.png',
    notes: [
      'Texturas de papelão e costura reforçam o tema do campo.',
      'Profundidade de maquete, com cenário em camadas.',
      'Ritmo visual mais calmo que o Wonder.',
    ],
    reference: {
      game: "Yoshi's Crafted World",
      studio: 'Nintendo, 2019',
      url: 'https://www.nintendo.com/us/store/products/yoshis-crafted-world-switch/',
    },
  },
  {
    id: 'painted',
    label: 'Pintado Detalhado',
    subtitle: 'Cenário ilustrado com pincel e luz de fim de tarde.',
    image:
      'https://media.base44.com/images/public/6aea33b7e062d7bfa620ba38/907ab6c4b_generated_image.png',
    notes: [
      'Fundo pintado dá riqueza de detalhe e clima.',
      'Exige contraste extra para o chão não se perder.',
      'Ótimo para as fases de crescimento e colheita.',
    ],
    reference: {
      game: 'Rayman Legends',
      studio: 'Ubisoft, 2013',
      url: 'https://www.ubisoft.com/en-us/game/rayman/legends',
    },
  },
  {
    id: 'fabric',
    label: 'Tátil de Tecido',
    subtitle: 'Tudo costurado em lã, feltro e brim.',
    image:
      'https://media.base44.com/images/public/6aea33b7e062d7bfa620ba38/dab30ebb0_generated_image.png',
    notes: [
      'Liga o algodão do jogo ao tecido da roupa.',
      'Traz charme, mas custa mais detalhe por elemento.',
      'Bom acabamento para menu e telas de resultado.',
    ],
    reference: {
      game: 'Sackboy: A Big Adventure',
      studio: 'Sumo Digital, 2020',
      url: 'https://www.playstation.com/en-us/games/sackboy-a-big-adventure/',
    },
  },
];

export default function References() {
  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 sm:py-12"
      style={{ background: 'linear-gradient(180deg,#D8F2FB 0,#F4F1DC 420px,#F7F2E7 100%)' }}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#1B120C] bg-[#FFFDF7] px-4 py-2 font-display text-sm font-extrabold text-[#1B120C] shadow-[0_4px_0_#1B120C] transition active:translate-y-[2px] active:shadow-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao jogo
        </Link>

        <header className="mt-7 max-w-3xl">
          <span className="inline-block rounded-full border-[3px] border-[#1B120C] bg-[#FFD23F] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#1B120C] shadow-[0_3px_0_#1B120C]">
            Painel comparativo
          </span>
          <h1 className="font-display mt-4 text-3xl font-black leading-[1.05] text-[#1B120C] sm:text-[46px]">
            Quatro direções para o mesmo campo de algodão
          </h1>
          <p className="mt-3 text-base font-semibold leading-relaxed text-[#4A4033]">
            Todos os estudos mostram Dão, o chão e os capulhos no mesmo trecho de fase, mudando só a
            linguagem visual. O escolhido foi o Wonder Saturado: contorno grosso, cor forte e forma
            arredondada, para o jogo continuar legível em celular.
          </p>
        </header>

        <StudyPanel />

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {STYLES.map((item) => (
            <ReferenceCard key={item.id} item={item} />
          ))}
        </div>

        <EffectsConcept />

        <p className="mt-10 rounded-[20px] border-[3px] border-[#1B120C] bg-[#FFFDF7] px-4 py-3 text-[11px] font-semibold leading-relaxed text-[#7A6A52]">
          Os estudos de direção foram gerados para este projeto. Os jogos citados aparecem apenas como
          referência de mercado, com nome do estúdio, e continuam pertencendo aos seus criadores.
        </p>
      </div>
    </div>
  );
}
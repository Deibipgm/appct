// Fase 6 · Aplicação Aérea: o Dão pilota o avião agrícola (motor em flight.js).
// Distâncias em blocos (48 px). Pragas (waves) entram pela direita quando o voo chega em `at`;
// obstáculos, capulhos, curiosidades e ninhos de bicudo estão na posição `at` do mundo e
// aparecem na tela uns 20 blocos antes (a largura da tela).
import { LEVEL_FACTS } from './facts';

// fileira de capulhos: [início, linha, quantos, passo, curva]
const line = (at, row, n = 4, step = 1.5, arc = 0) =>
  Array.from({ length: n }, (_, i) => [at + i * step, row - Math.round(Math.sin((i / Math.max(1, n - 1)) * Math.PI) * arc)]);

export const AEREO_LEVEL = {
  id: 'aereo',
  flight: true,
  noStretch: true,
  name: 'Aplicação Aérea',
  tag: 'Fase 6 · Aviação agrícola',
  mission: 'Pilotar o avião agrícola em voo rasante, proteger a lavoura das pragas e pulverizar os bicudos escondidos.',
  brief: 'O Dão assume o avião agrícola! Atire jatos de algodão nas pragas, desvie de torres e pivôs, pegue a gotinha azul de calda para pulverizar os bicudos escondidos na lavoura e derrube o Barão Bicudo.',
  tip: 'Pegue a gotinha azul: o avião pulveriza sozinho e acaba com os bicudos escondidos. Fuja dos raios da nuvem de tempestade!',
  seal: 'Piloto Agrícola',
  // só para o editor e as telas que leem o tema
  theme: {
    skyTop: '#2FA8F0',
    skyBottom: '#BFEAFF',
    hillFar: '#6FCB5A',
    hillNear: '#3FA34A',
    soil: '#E9A54C',
    soilDark: '#9A5322',
    grass: '#58C93A',
    grassLight: '#9BE86A',
    sun: '#FFD537',
  },
  // chefão próprio da fase aérea (aparece no fim do percurso)
  bossInfo: {
    name: 'Barão Bicudo',
    img: 'barao-bicudo.png',
    role: 'Voa num dirigível com aviãozinho enferrujado. Cospe gosma em leque, mira no avião e solta moscas. Acerte 35 jatos.',
  },
  length: 200,
  waves: [
    { at: 8, kind: 'mosca', y: 3, n: 3, gap: 30 },
    { at: 20, kind: 'mosca', y: 5, n: 4, spread: 40 },
    { at: 34, kind: 'traca', y: 4, n: 2, gap: 40 },
    { at: 46, kind: 'mosca', y: 2, n: 3 },
    { at: 64, kind: 'mosca', y: 2, n: 3 },
    { at: 70, kind: 'tempestade', y: 1 },
    { at: 78, kind: 'traca', y: 5, n: 2, gap: 40 },
    { at: 88, kind: 'percevejo', y: 4 },
    { at: 96, kind: 'mosca', y: 6, n: 4, spread: 30 },
    { at: 114, kind: 'mosca', y: 5, n: 4 },
    { at: 126, kind: 'percevejo', y: 3 },
    { at: 138, kind: 'traca', y: 3, n: 2, gap: 40 },
    { at: 152, kind: 'tempestade', y: 1 },
    { at: 156, kind: 'mosca', y: 3, n: 4, spread: 50 },
    { at: 168, kind: 'percevejo', y: 5 },
  ],
  ground: [
    { kind: 'torre', at: 46 },
    { kind: 'pivo', at: 80 },
    { kind: 'torre', at: 112 },
    { kind: 'torre', at: 119 },
    { kind: 'pivo', at: 140 },
    { kind: 'torre', at: 184 },
    { kind: 'pivo', at: 204 },
  ],
  // bicudos escondidos na lavoura (o capulho de pulverização vem 8 blocos antes)
  nests: [
    { at: 40, n: 3, y: 5 },
    { at: 68, n: 3, y: 6 },
    { at: 100, n: 3, y: 5 },
    { at: 128, n: 4, y: 5 },
    { at: 160, n: 3, y: 5 },
    { at: 190, n: 4, y: 6 },
  ],
  bolls: [
    ...line(24, 4, 5),
    ...line(33, 5, 5, 1.6, 3),
    ...line(44, 3, 4),
    ...line(56, 6, 5),
    ...line(72, 2, 4),
    ...line(86, 4, 5, 1.5, 2),
    ...line(100, 6, 4),
    ...line(108, 3, 5),
    ...line(122, 5, 4),
    ...line(134, 2, 5),
    ...line(146, 6, 4),
    ...line(158, 4, 5, 1.5, 2),
    ...line(170, 3, 4),
    ...line(190, 5, 5),
    ...line(200, 3, 5),
    ...line(210, 5, 4),
  ],
  // capulho dourado: tiro triplo e escudo por 8 segundos
  golden: [[56, 3], [77, 5], [118, 3], [150, 2], [206, 4]],
  facts: LEVEL_FACTS[6],
};

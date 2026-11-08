import { TILE, ROWS } from './config';
import { LEVEL_FACTS } from './facts';
import { SCENERY, rand } from './scenery';
import { SPRING_H } from './cotton';
import { kindOf } from './roster';
import { AEREO_LEVEL } from './aereoLevel';

const RAW_LEVELS = [
  {
    id: 'plantio',
    tutorial: true,
    name: 'A Grande Colheita',
    tag: 'Fase 1',
    mission: 'Proteger o plantio do algodão contra o bicudo e a mosca-branca.',
    brief: 'O Bicudão Gigante ronda o plantio! Use os capulhos-mola para alcançar os rolos lá no alto e derrote o chefão para abrir a saída.',
    boss: 'bicudo',
    tip: 'Derrote o Bicudão Gigante para liberar a saída!',
    seal: 'Mestre do Plantio',
    width: 130,
    groundTop: 10,
    rowOffset: 2,
    startX: 3,
    goalX: 126,
    // Surpresa: paredes secretas (quebram com soco e soltam capulhos).
    secrets: [{ x: 70, h: 2 }, { x: 90, h: 2 }],
    // Blocos e obstáculos desta fase são rolos de algodão com lona azul.
    blockStyle: 'rolo',
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
    facts: LEVEL_FACTS[0],
    pits: [{ x: 33, w: 2 }, { x: 56, w: 3 }, { x: 92, w: 2 }],
    // Sem plataformas no ar: todos os rolos ficam apoiados no solo,
    // empilhados como na arte (fileira, coluna de 2 ou 3 e pirâmide de 3).
    platforms: [],
    obstacles: [
      { x: 8 },
      { x: 12, w: 2 },
      { x: 17, shape: 'pyramid' },
      { x: 24, h: 2 },
      { x: 28, h: 3 },
      { x: 38, shape: 'pyramid' },
      { x: 42, w: 2 },
      { x: 45, h: 2 },
      { x: 61, shape: 'pyramid' },
      { x: 65, h: 2 },
      { x: 67, h: 3 },
      { x: 79, h: 3 },
      { x: 84, shape: 'pyramid' },
      { x: 88, w: 2 },
      { x: 97, h: 2 },
      { x: 101, shape: 'pyramid' },
      { x: 105, w: 2 },
    ],
    // capulhos-mola (super pulo)
    springs: [{ x: 26 }, { x: 54 }, { x: 76 }, { x: 108 }],
    bolls: [
      [5, 7], [8, 6], [10, 7], [12, 6], [13, 6],
      [17, 4], [18, 4], [21, 7], [24, 5],
      [26, 3], [27, 2], [31, 7], [33, 6], [34, 6],
      [38, 4], [39, 4], [42, 6], [43, 6], [45, 5], [50, 7],
      [56, 3], [57, 3], [58, 4], [61, 4], [62, 4], [67, 4],
      [72, 7], [76, 5], [77, 3], [78, 2],
      [84, 4], [85, 4], [88, 6], [89, 6], [92, 6], [93, 6],
      [97, 5], [101, 4], [102, 4], [105, 6], [106, 6],
      [108, 4], [110, 3], [111, 3], [112, 4], [116, 5], [119, 6], [124, 7],
    ],
    golden: [], // o dourado fica sempre em cima de uma mola (automático)
    // Elenco: bicudo (chão) e mosca-branca (ar). Trecho 1 só tem bicudo (aprender a pular/socar),
    // a mosca-branca entra no trecho 2 e depois os dois se misturam. Chegada livre.
    enemies: [
      { x: 21, row: 8, range: 1 },
      { x: 30, row: 8, range: 1 },
      { x: 36, row: 3, range: 3, type: 'whitefly' },
      { x: 51, row: 8, range: 2, skin: 'cochonilha' },
      { x: 63, row: 3, range: 3, type: 'whitefly' },
      { x: 73, row: 8, range: 1, skin: 'cochonilha' },
      { x: 95, row: 8, range: 1 },
      { x: 99, row: 3, range: 3, type: 'whitefly' },
    ],
  },
  {
    id: 'algodoeira',
    name: 'A Grande Algodoeira',
    tag: 'Fase 2',
    mission: 'Passar o algodão pelo beneficiamento: separar a pluma, limpar e prensar o fardo.',
    brief: 'A Faísca ameaça a algodoeira! Derrote o chefão para liberar a saída dos fardos.',
    boss: 'faisca',
    tip: 'Derrote a Faísca para liberar a saída!',
    seal: 'Mestre da Algodoeira',
    width: 136,
    groundTop: 10,
    rowOffset: 2,
    startX: 3,
    goalX: 132,
    secrets: [{ x: 65, h: 2 }, { x: 101, h: 2 }],
    // Esteira elevada: o primeiro capulho-mola (x 34) lança o Dão até ela e ela o leva para a frente.
    belts: [{ x: 37, w: 10, lift: 4, dir: 1 }],
    theme: {
      skyTop: '#7FB6D9',
      skyBottom: '#E3EEF4',
      hillFar: '#A9B8C4',
      hillNear: '#8798A6',
      soil: '#B9A68C',
      soilDark: '#7E6A52',
      grass: '#D9C9A3',
      grassLight: '#EFE3C4',
      sun: '#FFD86B',
    },
    facts: LEVEL_FACTS[2],
    obstacleStyle: 'fardinho',
    // Fardos da arte: 1 coluna (fardo1), 2 colunas (fardo2) e pilha alta (fardo4, 3 blocos),
    // que só se alcança pelo capulho-mola que vem antes dela.
    obstacles: [
      { x: 12, h: 2, art: 'fardo1' },
      { x: 19, w: 2, h: 2, art: 'fardo2' },
      { x: 25, h: 2, art: 'fardo1' },
      // Parede alta: trava o caminho do chão e obriga o Dão a subir pela mola e atravessar a esteira.
      { x: 36, w: 2, h: 3, art: 'fardo4' },
      { x: 48, w: 2, h: 2, art: 'fardo2' },
      { x: 58, h: 2, art: 'fardo1' },
      { x: 67, w: 2, h: 2, art: 'fardo2' },
      { x: 73, h: 2, art: 'fardo1' },
      { x: 82, w: 2, h: 3, art: 'fardo4' },
      { x: 88, h: 2, art: 'fardo1' },
      { x: 98, w: 2, h: 2, art: 'fardo2' },
      { x: 105, h: 2, art: 'fardo1' },
      { x: 112, w: 2, h: 3, art: 'fardo4' },
    ],
    springs: [{ x: 34 }, { x: 80 }, { x: 110 }],
    pits: [],
    platforms: [],
    // Capulhos no chão entre os fardos e por cima deles.
    bolls: [
      [7, 7], [9, 7], [12, 5], [16, 7], [19, 5], [25, 5], [29, 7], [32, 7],
      [48, 5], [49, 5], [53, 7], [55, 7],
      [58, 5], [62, 7], [64, 7], [67, 5], [73, 5], [77, 7], [79, 7], [82, 4],
      [83, 4], [88, 5], [92, 7], [95, 7], [98, 5], [99, 5], [105, 5], [109, 7],
      [112, 4], [116, 7], [120, 5], [124, 7], [127, 7],
      [38, 3], [40, 3], [44, 3], [46, 3],
    ],
    golden: [], // o dourado fica sempre em cima de uma mola (automático)
    enemies: [
      { x: 15, row: 8, range: 2, skin: 'folharao' },
      { x: 30, row: 8, range: 2, skin: 'casca' },
      { x: 53, row: 8, range: 3, skin: 'casca' },
      { x: 62, row: 8, range: 1, skin: 'folharao' },
      { x: 77, row: 8, range: 2, skin: 'casca' },
      { x: 92, row: 8, range: 3, skin: 'folharao' },
      { x: 103, row: 8, range: 1, skin: 'casca' },
      { x: 108, row: 8, range: 1, skin: 'folharao' },
    ],
  },
  {
    id: 'laboratorio',
    name: 'O Laboratório dos Desafios',
    tag: 'Fase 3',
    mission: 'Conduzir uma amostra de pluma pelas etapas de análise até a emissão do laudo de qualidade.',
    brief: 'Super Dão: a qualidade do algodão agora está em suas mãos! O Relógio 24h quer atrasar o laudo. Derrote o chefão!',
    boss: 'relogio',
    tip: 'Derrote o Relógio 24h para completar o laudo!',
    seal: 'Guardião da Qualidade',
    width: 150,
    groundTop: 10,
    rowOffset: 2,
    startX: 3,
    goalX: 147,
    secrets: [{ x: 30, h: 2 }, { x: 49, h: 2 }],
    theme: {
      skyTop: '#9FD8F0',
      skyBottom: '#EAF6FB',
      hillFar: '#C9D8E2',
      hillNear: '#A9BDCB',
      soil: '#C5D0D9',
      soilDark: '#7C8C9A',
      grass: '#E4EBF0',
      grassLight: '#FFFFFF',
      sun: '#FFE9A0',
    },
    facts: LEVEL_FACTS[4],
    pits: [],
    platforms: [],
    // Bandejas de amostras empilhadas como obstáculos.
    obstacleStyle: 'bandeja',
    // Bandejas, carrinhos de rolos e máquinas HVI como obstáculos (a arena do chefe fica livre).
    obstacles: [
      { x: 10 },
      { x: 18, h: 2 },
      { x: 26, w: 3, h: 2, art: 'hvi' },
      { x: 38, h: 2 },
      { x: 46, w: 2, h: 2, art: 'carrinho' },
      { x: 56 },
      { x: 62, w: 2, h: 2 },
      { x: 72, w: 3, h: 2, art: 'hvi' },
      { x: 84, h: 2 },
      { x: 92, w: 2, h: 2, art: 'carrinho' },
      { x: 102 },
      { x: 108, w: 3, h: 2, art: 'hvi' },
      { x: 118, h: 2 },
    ],
    bolls: [
      [6, 7], [8, 7], [10, 6], [14, 7], [18, 5], [22, 7], [26, 5], [27, 5], [28, 5],
      [32, 7], [35, 7], [42, 7], [46, 5], [47, 5], [51, 7], [54, 7], [56, 6],
      [59, 7], [62, 5], [66, 7], [69, 7], [72, 5], [73, 5], [74, 5], [79, 7],
      [84, 5], [88, 7], [92, 5], [93, 5], [97, 7], [102, 6], [105, 7],
      [108, 5], [109, 5], [110, 5], [114, 7], [121, 7], [124, 7],
    ],
    golden: [[44, 5], [88, 5], [125, 5]],
    enemies: [
      { x: 14, row: 8, range: 2, skin: 'fumagina' },
      { x: 22, row: 8, range: 2, skin: 'graxolino' },
      { x: 42, row: 8, range: 2, skin: 'plastico' },
      { x: 52, row: 8, range: 2, skin: 'fumagina' },
      { x: 68, row: 8, range: 2, skin: 'graxolino' },
      { x: 79, row: 8, range: 3, skin: 'plastico' },
      { x: 88, row: 8, range: 2, skin: 'fumagina' },
      { x: 105, row: 8, range: 1, skin: 'graxolino' },
      { x: 114, row: 8, range: 2, skin: 'plastico' },
      { x: 123, row: 8, range: 2, skin: 'fumagina' },
    ],
  },
  {
    id: 'fiacao',
    name: 'A Fiação Mágica',
    tag: 'Fase 4',
    mission: 'Transformar a pluma em fio e atravessar a fábrica de fiação.',
    brief: 'A pluma virou fio! Atravesse as pontes de fio, balance nas cordas sobre os vãos e derrote a Traça Rasga-Fio, que está roendo os fios da fábrica.',
    boss: 'traca',
    tip: 'Derrote a Traça Rasga-Fio para liberar a saída! Pule nas cordas para balançar e use o jato de vapor da carda para planar.',
    seal: 'Mestre da Fiação',
    width: 182,
    noStretch: true,
    groundTop: 10,
    rowOffset: 2,
    startX: 3,
    goalX: 176,
    blockStyle: 'fio',
    secrets: [],
    theme: {
      skyTop: '#E8B77A',
      skyBottom: '#F6DFB8',
      hillFar: '#C9A27A',
      hillNear: '#A9805A',
      soil: '#B9875A',
      soilDark: '#7E5634',
      grass: '#F2D9A8',
      grassLight: '#FFF1CF',
      sun: '#FFE3A0',
    },
    facts: LEVEL_FACTS[3],
    // Vãos de fio: o primeiro e o segundo se atravessam balançando nas cordas; o terceiro tem ponte com uma tábua faltando.
    pits: [{ x: 72, w: 6 }, { x: 84, w: 10 }, { x: 130, w: 13 }],
    // Pontes de fio. Nível 4 = ponte alta (sobe pela mola), nível 8 = ponte na altura do chão sobre o vão.
    platforms: [
      ...Array.from({ length: 12 }, (_, i) => ({ x: 36 + i, y: 4, w: 1 })),
      ...Array.from({ length: 13 }, (_, i) => ({ x: 130 + i, y: 8, w: 1 })).filter((p) => p.x !== 136 && p.x !== 137),
      ...Array.from({ length: 10 }, (_, i) => ({ x: 147 + i, y: 4, w: 1 })),
      // Escadas flutuantes de rolos de tecido: cada rolo leva ao próximo (só se pisa por cima).
      { x: 12, y: 6, w: 3, roll: true }, { x: 16, y: 4, w: 3, roll: true }, { x: 20, y: 2, w: 3, roll: true },
      { x: 99, y: 6, w: 3, roll: true }, { x: 103, y: 4, w: 3, roll: true }, { x: 107, y: 2, w: 3, roll: true },
    ],
    // Carretéis, rolos de tecido e a carda como obstáculos (a arena do chefão fica livre).
    obstacles: [
      { x: 9, w: 2, h: 2, art: 'carretel1' },
      { x: 27, w: 2, h: 2, art: 'carretel3' },
      { x: 38, w: 4, h: 3, art: 'carda' },
      { x: 64, w: 3, h: 2, art: 'carda' },
      { x: 122, w: 3, h: 2, art: 'carda' },
      { x: 151, w: 4, h: 3, art: 'carda' },
    ],
    // Cardas a vapor funcionais: o jato ergue o Dão e ele plana pelo ar.
    vents: [{ x: 64, w: 3, h: 2 }, { x: 122, w: 3, h: 2, phase: 100 }],
    springs: [{ x: 34 }, { x: 145 }],
    // Esteiras de fio: a primeira ajuda a andar, a segunda empurra para trás.
    belts: [
      { x: 54, w: 9, lift: 2, oneWay: true, dir: 1, art: 'fiacao-esteira', crop: [0, 0, 1, 0.62], artTop: 0.595 },
      { x: 112, w: 8, lift: 2, oneWay: true, dir: -1, art: 'fiacao-esteira', crop: [0, 0, 1, 0.62], artTop: 0.595 },
    ],
    // Cordas de balanço sobre os vãos (x em blocos, comprimento em pixels).
    ropes: [
      { x: 72, top: 10, len: 370 },
      { x: 85, top: 10, len: 370 },
      { x: 91, top: 10, len: 370 },
    ],
    bolls: [
      [6, 7], [7, 7], [12, 5], [13, 5], [14, 5], [16, 3], [17, 3], [18, 3], [20, 1], [21, 1], [22, 1], [25, 6], [26, 6],
      [31, 7], [32, 7],
      [37, 3], [39, 3], [41, 3], [43, 3], [45, 3],
      [55, 5], [57, 5], [59, 5], [61, 5],
      [67, 6], [68, 6],
      [73, 4], [75, 4], [76, 5],
      [80, 7], [81, 7], [82, 7],
      [85, 4], [88, 3], [90, 4], [93, 5],
      [96, 6], [99, 5], [100, 5], [101, 5], [103, 3], [104, 3], [105, 3], [107, 1], [108, 1], [109, 1],
      [113, 5], [114, 5], [121, 5], [125, 7], [126, 7],
      [131, 6], [133, 6], [135, 5], [139, 6], [141, 6],
      [148, 3], [150, 3], [152, 3], [154, 3],
    ],
    golden: [],
    enemies: [
      { x: 31, row: 8, range: 2, skin: 'sintetico' },
      { x: 46, row: 8, range: 1, skin: 'sintetico' },
      { x: 69, row: 8, range: 1, skin: 'sintetico' },
      { x: 80, row: 8, range: 1, skin: 'sintetico' },
      { x: 96, row: 8, range: 1, skin: 'sintetico' },
      { x: 127, row: 8, range: 1, skin: 'sintetico' },
    ],
  },
  {
    id: 'manejo',
    name: 'Operação Campo Limpo',
    tag: 'Fase 5 · Fitossanitário',
    mission: 'Depois da colheita, deixar o campo sem abrigo para o bicudo: destruir soqueiras, monitorar armadilhas, eliminar tigueras e cobrir a carga.',
    brief: 'Acompanhe o trator na Operação Campo Limpo! Destrua as soqueiras, ative as armadilhas de feromônio, arranque as tigueras e cubra a carga do caminhão. No fim, ache o Bicudão escondido nos restos da lavoura.',
    boss: 'bicudao',
    tip: 'Soque ou pise nas soqueiras e tigueras, encoste nas armadilhas e no caminhão, pegue as joaninhas contra a mosca-branca. No fim, soque os montes de restos para achar o Bicudão!',
    seal: 'Campo Limpo',
    width: 170,
    noStretch: true,
    groundTop: 10,
    rowOffset: 2,
    startX: 3,
    goalX: 164,
    blockStyle: 'rolo',
    secrets: [],
    theme: {
      skyTop: '#38B6F2',
      skyBottom: '#CDEFFF',
      hillFar: '#7BCF5E',
      hillNear: '#46A84C',
      soil: '#C98A45',
      soilDark: '#87501F',
      grass: '#5FCB3F',
      grassLight: '#A6EA72',
      sun: '#FFD537',
    },
    facts: LEVEL_FACTS[5],
    // Operação Campo Limpo (x em blocos)
    soqueiras: [6, { x: 12, bug: true }, 18, 40, 46, { x: 86, bug: true }, 95, { x: 127, bug: true }],
    traps: [27, 114],
    tigueras: [64, 68, 72, 104, 107],
    // potes de joaninhas: elas comem as moscas-brancas
    jars: [66, 117],
    truck: 133,
    // arena final: montes de restos da lavoura (o Bicudão está em um deles)
    piles: [150, 154, 158],
    pits: [{ x: 49, w: 2 }, { x: 100, w: 2 }],
    platforms: [],
    obstacles: [
      { x: 9 },
      { x: 14, w: 2 },
      { x: 22, shape: 'pyramid' },
      { x: 44, h: 2 },
      { x: 54, w: 2 },
      { x: 60, w: 2, h: 3 },
      { x: 88, shape: 'pyramid' },
      { x: 92, h: 2 },
      { x: 110, w: 2 },
    ],
    springs: [{ x: 58 }],
    bolls: [
      [5, 7], [7, 7], [9, 6], [11, 7], [14, 6], [15, 6], [20, 7], [22, 4], [23, 4],
      [30, 7], [33, 6], [36, 7], [39, 6], [42, 7], [44, 5], [47, 7], [49, 5], [50, 5],
      [54, 6], [55, 6], [60, 4], [61, 4], [65, 7], [70, 7],
      [74, 7], [78, 6], [82, 7], [88, 4], [89, 4], [92, 5], [97, 7],
      [100, 5], [101, 5], [105, 7], [110, 6], [111, 6],
      [118, 7], [121, 6], [124, 7], [130, 7], [139, 7], [142, 7],
    ],
    golden: [],
    // Elenco: bicudo (vai para a armadilha ou sai das soqueiras) e mosca-branca.
    enemies: [
      { x: 31, row: 8, range: 1 },
      { x: 34, row: 8, range: 1 },
      { x: 37, row: 8, range: 1 },
      { x: 76, row: 3, range: 3, type: 'whitefly' },
      { x: 82, row: 4, range: 3, type: 'whitefly' },
      { x: 97, row: 8, range: 1 },
      { x: 118, row: 8, range: 1 },
      { x: 121, row: 8, range: 1 },
      { x: 121, row: 3, range: 3, type: 'whitefly' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Ritmo das fases: as fases foram desenhadas curtas e apertadas. Aqui esticamos o
// percurso (mais chão entre obstáculos, buracos e inimigos) sem mexer na luta do chefão.
// Trechos "rígidos" (mola + parede alta + esteira, arena do chefão) mantêm a distância original.
const STRETCH = 1.55;
const RIGID = { algodoeira: [[30, 50]] };

function stretchLevel(def) {
  if (def.noStretch) return def;
  const k = STRETCH;
  const end = def.goalX - 20;
  const rigid = [...(RIGID[def.id] ?? []), [end, 1e9]];
  const f = (x) => {
    let v = x * k;
    for (const [a, b] of rigid) v -= Math.max(0, Math.min(x, b) - a) * (k - 1);
    return Math.round(v);
  };
  const gt = def.groundTop ?? 8;
  const sx = (o) => ({ ...o, x: f(o.x) });
  const obstacles = (def.obstacles ?? []).map(sx);
  const pits = (def.pits ?? []).map(sx);
  // mola sempre a mesma distância do que ela ajuda a passar (buraco ou parede alta)
  const targets = [
    ...(def.pits ?? []).map((p) => p.x),
    ...(def.obstacles ?? []).filter((o) => (o.h ?? 1) >= 3).map((o) => o.x),
  ];
  const springs = (def.springs ?? []).map((sp) => {
    const t = targets.filter((x) => x > sp.x && x - sp.x <= 6).sort((a, b) => a - b)[0];
    return { ...sp, x: t === undefined ? f(sp.x) : f(t) - (t - sp.x) };
  });
  // capulhos: os originais acompanham o esticão; no vão entre dois deles entra mais um
  const scaled = (def.bolls ?? []).map(([x, y]) => [f(x), y]).sort((a, b) => a[0] - b[0]);
  const blocked = (x, y) => {
    const row = y + (def.rowOffset ?? 0);
    if (secs.some((sc) => Math.abs(sc.x - x) <= 1 && row >= gt - (sc.h ?? 2) - 1 && row < gt)) return true;
    return obstacles.some((o) => {
      const w = o.shape === 'pyramid' ? 2 : o.w ?? 1;
      const h = o.shape === 'pyramid' ? 2 : o.h ?? 1;
      return x >= o.x - 1 && x < o.x + w + 1 && row >= gt - h - 2 && row < gt;
    });
  };
  const secs = (def.secrets ?? []).map(sx);
  const bolls = [];
  scaled.forEach((b, i) => {
    bolls.push(b);
    const n = scaled[i + 1];
    if (!n) return;
    const gap = n[0] - b[0];
    if (gap >= 4 && gap <= 12) {
      for (let g = 1; g * 2.5 < gap; g++) {
        const x = Math.round(b[0] + g * 2.5);
        const y = Math.round(b[1] + ((n[1] - b[1]) * (x - b[0])) / gap);
        if (!blocked(x, y) && !pits.some((p) => x >= p.x - 1 && x < p.x + p.w + 1)) bolls.push([x, y]);
      }
    }
  });
  // inimigos: o esticão deixa buracos grandes; entra um bicho no meio, num chão livre
  const foes = (def.enemies ?? []).map(sx).sort((a, b) => a.x - b.x);
  const freeAt = (x, r) =>
    !obstacles.some((o) => x + r + 2 > o.x && x - r - 1 < o.x + (o.shape === 'pyramid' ? 2 : o.w ?? 1)) &&
    !pits.some((pt) => x + r + 2 > pt.x && x - r - 1 < pt.x + pt.w) &&
    !springs.some((sp) => Math.abs(sp.x - x) < r + 3);
  const withFill = [];
  foes.forEach((e, i) => {
    withFill.push(e);
    const n = foes[i + 1];
    if (!n || n.x - e.x <= 18) return;
    const ground = [e, n].find((q) => q.type !== 'whitefly') ?? e;
    for (let d = 0; d <= 6; d++) {
      const x = Math.round((e.x + n.x) / 2) + (d % 2 ? d : -d);
      if (freeAt(x, 2)) {
        withFill.push({ x, row: ground.row ?? 8, range: 2, ...(ground.skin ? { skin: ground.skin } : {}) });
        break;
      }
    }
  });
  const goalX = f(def.goalX);
  return {
    ...def,
    width: goalX + (def.width - def.goalX),
    goalX,
    obstacles,
    pits,
    springs,
    bolls,
    secrets: (def.secrets ?? []).map(sx),
    belts: (def.belts ?? []).map(sx),
    platforms: (def.platforms ?? []).map(sx),
    enemies: withFill,
    golden: (def.golden ?? []).map(([x, y]) => [f(x), y]),
    facts: (def.facts ?? []).map(sx),
  };
}

export const LEVELS = [...RAW_LEVELS, AEREO_LEVEL].map(stretchLevel);

const EMPTY = 0;
const GROUND = 1;
const PLATFORM = 2;
const OBSTACLE = 3;

export function buildLevel(def) {
  const width = def.width;
  const groundTop = def.groundTop ?? 8;
  const grid = Array.from({ length: ROWS }, () => new Array(width).fill(EMPTY));
  const pits = def.pits ?? [];
  const inPit = (x) => pits.some((p) => x >= p.x && x < p.x + p.w);

  for (let x = 0; x < width; x++) {
    if (inPit(x)) continue;
    for (let y = groundTop; y < ROWS; y++) grid[y][x] = GROUND;
  }

  (def.platforms ?? []).forEach((p) => {
    for (let x = p.x; x < p.x + p.w; x++) {
      const py = p.y + (def.rowOffset ?? 0);
      if (x >= 0 && x < width && py >= 0 && py < ROWS) grid[py][x] = PLATFORM;
    }
  });

  // Pirâmide de rolos (2 embaixo, 1 em cima, centralizado), como na arte de empilhamento.
  // A colisão do topo ocupa as 2 colunas; o desenho do rolo de cima fica no meio delas.
  const rollTops = {};
  (def.obstacles ?? []).forEach((o) => {
    if (o.shape !== 'pyramid') return;
    for (let x = o.x; x < o.x + 2; x++) {
      for (let y = groundTop - 2; y < groundTop; y++) {
        if (x >= 0 && x < width) grid[y][x] = OBSTACLE;
      }
    }
    rollTops[`${o.x},${groundTop - 2}`] = 'center';
    rollTops[`${o.x + 1},${groundTop - 2}`] = 'skip';
  });

  // obstáculos com arte própria: guardam as células para o desenho pular os blocos
  const artObstacles = [];
  const artCells = new Set();
  (def.obstacles ?? []).forEach((o) => {
    if (!o.art) return;
    artObstacles.push({ x: o.x, w: o.w ?? 1, h: o.h ?? 1, art: o.art });
    for (let x = o.x; x < o.x + (o.w ?? 1); x++) {
      for (let y = groundTop - (o.h ?? 1); y < groundTop; y++) artCells.add(`${x},${y}`);
    }
  });

  (def.obstacles ?? []).forEach((o) => {
    if (o.shape === 'pyramid') return;
    const w = o.w ?? 1;
    const h = o.h ?? 1;
    for (let x = o.x; x < o.x + w; x++) {
      for (let y = groundTop - h; y < groundTop; y++) {
        if (x >= 0 && x < width && y >= 0 && y < ROWS) grid[y][x] = OBSTACLE;
      }
    }
  });

  // rowOffset desce tudo o que está no ar junto com a linha do chão (fundo fica parado)
  const ro = def.rowOffset ?? 0;
  const bolls = (def.bolls ?? []).map(([x, y]) => ({
    x: x * TILE + TILE / 2,
    y: (y + ro) * TILE + TILE / 2,
    taken: false,
  }));

  // Fases com molas: o capulho dourado fica sempre bem acima de cada mola (só se alcança pulando nela).
  const springGolden = (def.springs ?? []).map((sp) => [sp.x, null]);
  const golden = (springGolden.length ? springGolden : def.golden ?? []).map(([x, y], i) => ({
    x: x * TILE + TILE / 2,
    y: y === null ? groundTop * TILE - 250 : (y + ro) * TILE + TILE / 2,
    phase: i * 1.7,
    taken: false,
  }));

  const keys = (def.items ?? []).map(([x, y, label, kind]) => ({
    x: x * TILE + TILE / 2,
    y: (y + ro) * TILE + TILE / 2,
    label,
    kind,
    taken: false,
  }));

  const enemies = (def.enemies ?? []).map((e, i) => {
    const kind = kindOf(e);
    const isAir = kind.type === 'whitefly';
    const { w, h } = kind;
    const baseX = e.x * TILE;
    const row = e.row + ro;
    return {
      type: isAir ? 'whitefly' : 'weevil',
      x: baseX,
      y: isAir ? row * TILE : row * TILE - h,
      baseY: isAir ? row * TILE : row * TILE - h,
      w,
      h,
      vx: i % 2 === 0 ? kind.speed : -kind.speed,
      minX: baseX - e.range * TILE,
      maxX: baseX + e.range * TILE + w,
      t: i * 0.7,
      seed: i,
      skin: e.skin,
      speed: kind.speed,
      mode: 'hover',
      diveT: 0,
      alert: false,
      dead: false,
      deadT: 0,
    };
  });

  // capulhos-mola: ficam em cima do chão (ou do bloco) na linha indicada
  const springs = (def.springs ?? []).map((sp) => ({
    x: sp.x * TILE + TILE / 2,
    y: (sp.row ?? groundTop) * TILE,
    h: SPRING_H + 10 + 28,
    squash: 0,
  }));

  const scenery = SCENERY[def.id] ?? SCENERY.plantio;
  const decor = [];
  const lastDecor = Math.min(width - 4, (def.goalX ?? width) - 5);
  for (let x = 2; x < lastDecor; x++) {
    if (inPit(x) || grid[groundTop - 1][x] !== EMPTY) continue;
    if (!scenery.props.length || rand(x * 3.7 + width * 0.31) > 0.62) continue;
    const kind = scenery.props[Math.floor(rand(x * 9.1 + 3) * scenery.props.length)];
    decor.push({ x, kind });
    const [minGap, maxGap] = scenery.gap;
    x += minGap + Math.floor(rand(x * 5.3 + 1) * (maxGap - minGap + 1));
  }

  const curiosities = (def.facts ?? []).map((f) => ({
    x: f.x * TILE + TILE / 2,
    y: (f.y + ro) * TILE + TILE / 2,
    title: f.title,
    text: f.text,
    taken: false,
  }));

  // surpresas: paredes secretas (quebram com soco), flores do algodão e esteiras
  const secrets = (def.secrets ?? []).map((sc) => {
    const h = sc.h ?? 2;
    for (let y = groundTop - h; y < groundTop; y++) grid[y][sc.x] = OBSTACLE;
    return { x: sc.x, h, broken: false };
  });
  // esteira elevada: bloco sólido desenhado com a arte (não passa pelos blocos comuns)
  const belts = def.belts ?? [];
  belts.forEach((b) => {
    if (!b.lift) return;
    const by = groundTop - b.lift;
    for (let x = b.x; x < b.x + b.w; x++) {
      grid[by][x] = b.oneWay ? PLATFORM : OBSTACLE;
      artCells.add(`${x},${by}`);
    }
  });

  // Organização visual (para não lotar a tela e não atrapalhar o salto):
  //  - perto de uma mola só fica capulho dourado;
  //  - curiosidades e itens da fase não ficam sobre buracos nem junto das molas.
  const springCols = springs.map((sp) => Math.floor(sp.x / TILE));
  const nearSpring = (c, d) => springCols.some((sc) => Math.abs(c - sc) <= d);
  const nearPit = (c) => pits.some((pt) => c >= pt.x - 2 && c <= pt.x + pt.w + 1);
  bolls.splice(0, bolls.length, ...bolls.filter((b) => !nearSpring(Math.floor(b.x / TILE), 3)));
  const bad = (c) => nearSpring(c, 4) || nearPit(c);
  // curiosidade da fase com esteira: fica em cima da esteira (só quem passa por ela pega)
  const liftBelt = belts.find((b) => b.lift && !b.art);
  if (liftBelt && curiosities.length) {
    const c0 = curiosities[0];
    c0.x = (liftBelt.x + liftBelt.w / 2) * TILE;
    c0.y = (groundTop - liftBelt.lift) * TILE - 44;
    c0.pinned = true;
  }
  const things = [...keys, ...curiosities.filter((c) => !c.pinned)];
  const used = things.map((t) => Math.floor(t.x / TILE)).filter((c) => !bad(c));
  const spotRow = groundTop - 3;
  things.forEach((t) => {
    const col = Math.floor(t.x / TILE);
    if (!bad(col)) return;
    for (let d = 1; d < 70; d++) {
      const c = [col + d, col - d].find(
        (k) => k > 3 && k < width - 5 && !bad(k) && grid[spotRow][k] === EMPTY && !used.some((u) => Math.abs(u - k) < 4),
      );
      if (c === undefined) continue;
      t.x = c * TILE + TILE / 2;
      t.y = spotRow * TILE + TILE / 2;
      used.push(c);
      return;
    }
  });

  return { ...def, secrets, belts, grid, groundTop, rollTops, artObstacles, artCells, springs, bolls, golden, keys, enemies, decor, curiosities, scenery };
}
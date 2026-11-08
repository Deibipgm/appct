import { ART } from './sprites';

export const rand = (n) => {
  const s = Math.sin(n * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

// Cada fase tem sua própria paisagem: vegetação, detalhe do solo e silhueta de fundo.
export const SCENERY = {
  plantio: {
    backdrop: ART.colheitaCampo,
    // colhedora animada (balança e solta poeira) e chão com a textura da própria lavoura
    anim: 'harvester',
    groundTexture: ART.campoChao,
    tint: 'rgba(24, 48, 20, 0.12)',
    props: [],
    gap: [2, 3],
    surface: 'seedling',
    landmark: 'pivot',
  },
  colheita: {
    backdrop: ART.patio,
    fit: { mode: 'width', bottom: 430 },
    props: ['bale', 'stalk', 'crate', 'bush', 'stalk'],
    gap: [2, 4],
    surface: 'stubble',
    landmark: 'harvester',
  },
  algodoeira: {
    backdrop: ART.usina,
    anim: 'gin',
    hideGround: true,
    props: [],
    gap: [3, 5],
    surface: 'lab',
  },
  fiacao: {
    backdrop: ART.fiacaoFundo,
    hideGround: true,
    props: [],
    gap: [3, 5],
    surface: 'lab',
  },
  // Fase bônus: trator amarelo passando a grade de disco, poeira e nuvens animadas
  manejo: {
    backdrop: ART.manejoFundo,
    anim: 'trator',
    groundTexture: ART.campoChao,
    tint: 'rgba(24, 48, 20, 0.1)',
    props: [],
    gap: [2, 3],
    surface: 'seedling',
  },
  laboratorio: {
    backdrop: ART.lab,
    hideGround: true,
    anim: 'lab',
    props: [],
    gap: [3, 5],
    surface: 'lab',
  },
};
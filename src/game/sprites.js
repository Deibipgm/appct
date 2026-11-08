// Artes conceituais do jogo. Enquanto a imagem não carrega,
// cada função de desenho usa o desenho vetorial antigo.
// BASE_URL é '/' no Base44 e './' na versão de navegador avulsa (abre de qualquer pasta).
export const ART_BASE = `${import.meta.env?.BASE_URL ?? '/'}art/`;

export const ART = {
  hero: `${ART_BASE}heroi.png`,
  faisca: `${ART_BASE}faisca.png`,
  traca: `${ART_BASE}traca.png`,
  mola: `${ART_BASE}mola.png`,
  nuvem: `${ART_BASE}fiacao-nuvem.png`,
  corda: `${ART_BASE}fiacao-corda.png`,
  fiacaoFundo: `${ART_BASE}fiacao-fundo.jpg`,
  relogioChefe: `${ART_BASE}relogio-chefe.png`,
  camisa: `${ART_BASE}camisa-sou-de-algodao.png`,
  heroJoia: [0, 1, 2].map((i) => `${ART_BASE}heroi-joia-${i}.png`),
  logoSuperDao: `${ART_BASE}logo-superdao.png`,
  weevil: `${ART_BASE}bicudo.png`,
  bale: `${ART_BASE}fardo.png`,
  usina: `${ART_BASE}usina-cartoon.jpg`,
  lab: `${ART_BASE}laboratorio-hvi.jpg`,
  lavoura: `${ART_BASE}lavoura.jpg`,
  patio: `${ART_BASE}patio-fardos.jpg`,
  whitefly: `${ART_BASE}mosca.png`,
  roll: `${ART_BASE}rolo.png`,
  rollStack: `${ART_BASE}rolos-piramide.png`,
  colheitaCampo: `${ART_BASE}colheita-campo.jpg`,
  campoNuvens: `${ART_BASE}colheita-nuvens.png`,
  campoMaquina: `${ART_BASE}colheita-maquina.png`,
  campoChao: `${ART_BASE}campo-chao.jpg`,
  telaPrincipal: `${ART_BASE}tela-principal.jpg`,
  logoAbapa: `${ART_BASE}logo-abapa.png`,
  logoAbapaH: `${ART_BASE}logo-abapa-horizontal.png`,
  logoAgro: `${ART_BASE}logo-conhecendo-agro.png`,
  seloAbr: `${ART_BASE}selo-abr.png`,
  armadilha: `${ART_BASE}armadilha-feromonio.png`,
  manejoFundo: `${ART_BASE}manejo-fundo-limpo.jpg`,
  manejoNuvens: `${ART_BASE}manejo-nuvens.png`,
  manejoFrente: `${ART_BASE}manejo-frente.png`,
  caminhaoAberto: `${ART_BASE}caminhao-aberto.png`,
  caminhaoLona: `${ART_BASE}caminhao-lona.png`,
  soqueira1: `${ART_BASE}soqueira-1.png`,
  soqueira2: `${ART_BASE}soqueira-2.png`,
  soqueira3: `${ART_BASE}soqueira-3.png`,
  // Fase 6 · Aplicação Aérea
  aviao: `${ART_BASE}aviao.png`,
  barao: `${ART_BASE}barao-bicudo.png`,
  tempestade: `${ART_BASE}aereo-tempestade.png`,
  torre: `${ART_BASE}aereo-torre.png`,
  poste: `${ART_BASE}aereo-poste.png`,
  pivo: `${ART_BASE}aereo-pivo.png`,
  fileira: `${ART_BASE}aereo-fileira.png`,
  aereoFundo: `${ART_BASE}aereo-fundo.jpg`,
  aereoNuvem: `${ART_BASE}aereo-nuvem.png`,
  mariposa: `${ART_BASE}mariposa.png`,
  percevejo: `${ART_BASE}percevejo.png`,
};

const cache = new Map();

export function getSprite(url) {
  if (!url || typeof Image === 'undefined') return null;
  let img = cache.get(url);
  if (!img) {
    img = new Image();
    img.decoding = 'async';
    img.src = url;
    cache.set(url, img);
  }
  return img.complete && img.naturalWidth ? img : null;
}

// Pré-carrega as artes para não piscar o desenho antigo no primeiro quadro.
export function preloadArt() {
  Object.values(ART).flat().forEach(getSprite);
}

// Desenha a imagem centrada em (cx, cy) com largura w, virada para dir (1 ou -1),
// com rotação e "squash & stretch" (sx, sy) no estilo dos desenhos animados.
export function drawSprite(ctx, img, cx, cy, w, { dir = 1, rot = 0, sx = 1, sy = 1, anchorY = 0.5 } = {}) {
  const h = (w * img.naturalHeight) / img.naturalWidth;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(dir * sx, sy);
  ctx.drawImage(img, -w / 2, -h * anchorY, w, h);
  ctx.restore();
  return h;
}

// Acabamento de desenho animado antigo: granulado de filme que tremula e vinheta nas bordas.
let grain = null;
function grainCanvas() {
  if (grain || typeof document === 'undefined') return grain;
  grain = document.createElement('canvas');
  grain.width = 256;
  grain.height = 256;
  const g = grain.getContext('2d');
  const data = g.createImageData(256, 256);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() * 255;
    data.data[i] = v;
    data.data[i + 1] = v * 0.92;
    data.data[i + 2] = v * 0.8;
    data.data[i + 3] = Math.random() < 0.5 ? 26 : 0;
  }
  g.putImageData(data, 0, 0);
  return grain;
}

export function drawVintageFilter(ctx, w, h, time) {
  const tex = grainCanvas();
  if (tex) {
    const ox = Math.floor((time * 977) % 256);
    const oy = Math.floor((time * 613) % 256);
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.translate(-ox, -oy);
    ctx.fillStyle = ctx.createPattern(tex, 'repeat');
    ctx.fillRect(ox, oy, w, h);
    ctx.restore();
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, w * 0.68);
  v.addColorStop(0, 'rgba(60, 35, 10, 0)');
  v.addColorStop(1, 'rgba(60, 35, 10, 0.34)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
  // tom sépia bem leve por cima de tudo
  ctx.fillStyle = 'rgba(255, 214, 150, 0.05)';
  ctx.fillRect(0, 0, w, h);
}
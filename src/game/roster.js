// Elenco de inimigos do jogo, num lugar só: o tamanho da caixa de colisão, a velocidade
// e a função de cada um. As fases só dizem ONDE o inimigo aparece (levels.js).
//
// Regras de design (valem para as 3 fases):
//  1. Cada fase tem um elenco próprio, tirado do portfólio de artes conceituais.
//  2. Um tipo novo entra por vez, em trecho livre, para o jogador aprender antes de misturar.
//  3. Nenhum inimigo patrulha por dentro de obstáculo nem sobre buraco (tools/analyze.mjs confere).
//  4. A densidade sobe devagar ao longo da fase e o trecho antes da chegada fica livre.
export const ENEMY_KINDS = {
  // Fase 1 · Plantio
  weevil: { type: 'weevil', label: 'Bicudo', w: 40, h: 40, speed: 1.15, role: 'Terrestre. Anda e, em alerta, investe contra o herói.' },
  whitefly: { type: 'whitefly', label: 'Mosca-branca', w: 36, h: 28, speed: 1.15, role: 'Voadora. Pressiona o jogador no ar e mergulha.' },
  // Fase 1 · Plantio (cont.)
  cochonilha: { type: 'weevil', label: 'Cochonilha', w: 40, h: 34, speed: 0.9, role: 'Lenta e pegajosa: gruda no herói e dificulta o avanço.' },
  // Fase 2 · Algodoeira
  folharao: { type: 'weevil', label: 'Folharão', w: 40, h: 34, speed: 1.15, role: 'Resíduo vegetal que gira em redemoinho.' },
  casca: { type: 'weevil', label: 'Casca-Bruta', w: 40, h: 34, speed: 1.15, role: 'Arremessa fragmentos de casca e caroço.' },
  // Chefão da Fase 4 (só aparece como chefe)
  traca: { type: 'whitefly', label: 'Traça', w: 36, h: 28, speed: 1.15, role: 'Voadora esfarrapada: rói fios e mergulha sobre o herói.' },
  // Fase 4 · Fiação: as fibras sintéticas são as rivais das roupas de algodão
  sintetico: { type: 'weevil', label: 'Sintético', w: 40, h: 34, speed: 1.1, role: 'Fibra sintética: não respira como o algodão e quer tomar o lugar das roupas naturais.' },
  // Fase 3 · Laboratório
  fumagina: { type: 'weevil', label: 'Fumagina', w: 40, h: 34, speed: 1.15, role: 'Espalha fuligem e manchas.' },
  graxolino: { type: 'weevil', label: 'Graxolino', w: 40, h: 34, speed: 1.15, role: 'Deixa poças escorregadias de óleo.' },
  relogio: { type: 'weevil', label: 'Relógio 24h', w: 40, h: 34, speed: 1.15, role: 'Ondas de alarme criam desafios de tempo.' },
  // Fase bônus · Campo Responsável
  microbio: { type: 'weevil', label: 'Micróbio Maluco', w: 40, h: 36, speed: 1.05, role: 'Doença da lavoura: aparece quando o manejo é descuidado.' },
  plastico: { type: 'weevil', label: 'Plastição', w: 40, h: 34, speed: 1.15, role: 'Lança tiras plásticas que prendem o herói.' },
  // Fase 6 · Aplicação Aérea (só aparecem no voo; tamanho e vida ficam em flightFoes.js)
  aereoMosca: { type: 'whitefly', label: 'Mosca-branca', w: 36, h: 28, speed: 1, role: 'Voa em ondas, sobe e desce. Um jato derruba.' },
  mariposa: { type: 'whitefly', label: 'Mariposa', w: 36, h: 28, speed: 1, role: 'Persegue a altura do avião. Leva 2 jatos.' },
  aereoBicudo: { type: 'whitefly', label: 'Bicudo na lavoura', w: 36, h: 28, speed: 1, role: 'Escondido entre os pés de algodão (marcado com !). Pegue a gotinha azul e pulverize voando baixo.' },
  percevejo: { type: 'whitefly', label: 'Percevejo', w: 36, h: 28, speed: 1, role: 'Blindado: quando se alinha com o avião, investe em linha reta. Leva 4 jatos.' },
  tempestade: { type: 'whitefly', label: 'Nuvem de tempestade', w: 36, h: 28, speed: 1, role: 'Não dá para derrubar: pisca e solta um raio até a lavoura. Saia de baixo!' },
};

// Quem aparece em cada fase (a ordem é a ordem de apresentação).
export const PHASE_ROSTER = {
  plantio: ['weevil', 'whitefly', 'cochonilha'],
  algodoeira: ['folharao', 'casca'],
  fiacao: ['sintetico'],
  laboratorio: ['fumagina', 'graxolino', 'plastico'],
  manejo: ['weevil', 'whitefly'],
  aereo: ['aereoMosca', 'mariposa', 'percevejo', 'tempestade', 'aereoBicudo'],
};

export const kindOf = (e) => ENEMY_KINDS[e.skin || e.type || 'weevil'] ?? ENEMY_KINDS.weevil;

import { jsPDF } from 'jspdf';
import { ART, ART_BASE } from './sprites';

const BASE = 'https://base44.app/api/apps/6aea33b7e062d7bfa620ba38/files/mp/public/6aea33b7e062d7bfa620ba38/';
const EXTRA = {
  folharao: `${ART_BASE}folharao.png`,
  cascaBruta: `${ART_BASE}casca.png`,
  fardinhos: `${BASE}d3023bb07_fardos.png`,
  fardosEmPe: `${BASE}23e41efd1_fardos.png`,
  vilaoLaboratorio: `${BASE}343c4efe3_vilao_laboratorio.png`,
};

function load(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve({ data: c.toDataURL('image/png'), w: c.width, h: c.height });
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// Gera um PDF com uma imagem do jogo por página, com o nome de cada uma.
export async function downloadArtPdf() {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const entries = Object.entries({ ...ART, ...EXTRA });
  let first = true;
  for (const [name, url] of entries) {
    const img = await load(url);
    if (!img) continue;
    if (!first) pdf.addPage();
    first = false;
    pdf.setFontSize(16);
    pdf.text(name, 14, 14);
    const k = Math.min(269 / img.w, 178 / img.h);
    const w = img.w * k;
    const h = img.h * k;
    pdf.addImage(img.data, 'PNG', (297 - w) / 2, 22 + (178 - h) / 2, w, h);
  }
  pdf.save('imagens-do-jogo.pdf');
}
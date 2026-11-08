// Versão avulsa do jogo para o navegador: só o jogo, sem login e sem o Base44.
// Gerar: npm run build:web  ->  pasta dist-web/ (abre o index.html direto no navegador)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Game from '@/pages/Game';
import '@/index.css';
// fontes do jogo embutidas: funcionam sem internet (APK e arquivo aberto direto)
import '@fontsource/baloo-2/latin-500.css';
import '@fontsource/baloo-2/latin-600.css';
import '@fontsource/baloo-2/latin-700.css';
import '@fontsource/baloo-2/latin-800.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-600.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <MemoryRouter>
    <Game />
  </MemoryRouter>
);

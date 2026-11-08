// Build da versão de navegador, independente do Base44 (sem plugin, sem login).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  base: './',
  publicDir: path.resolve(here, '../public'),
  plugins: [react(), viteSingleFile()],
  resolve: { alias: { '@': path.resolve(here, '../src') } },
  css: { postcss: path.resolve(here, '..') },
  build: { outDir: path.resolve(here, '../dist-web'), emptyOutDir: true },
});

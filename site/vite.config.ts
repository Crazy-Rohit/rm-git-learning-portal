import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: '/rm-git-learning-portal/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(dir, 'index.html'),
        stage1: resolve(dir, 'stage-1.html'),
        progress: resolve(dir, 'progress.html'),
        verify: resolve(dir, 'verify.html'),
      },
    },
  },
});

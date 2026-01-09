import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'img',
  base: '/zataka-ts/', // GitHub Pages base path
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2022',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 8000,
    open: true
  }
});

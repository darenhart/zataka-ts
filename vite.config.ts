import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'img',
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

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  publicDir: 'public',
  assetsInclude: ['**/*.glb', '**/*.ply', '**/*.glsl']
}); 
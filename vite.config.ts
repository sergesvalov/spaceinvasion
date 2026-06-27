import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // For better compatibility with Capacitor and relative paths
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});

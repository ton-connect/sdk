import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@ton-connect/core']
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/@ton-connect\/core/, /node_modules/]
    }
  },
});

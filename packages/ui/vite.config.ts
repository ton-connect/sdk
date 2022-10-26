import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin({ extensions: ['ts'] })],
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    include: ['@tonconnect/sdk'],
    exclude: ['csstype']
  },
  build: {
    target: 'esnext',
    commonjsOptions: {
      include: [/@tonconnect\/sdk/, /node_modules/]
    }
  },
});

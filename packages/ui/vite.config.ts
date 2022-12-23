import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [
      solidPlugin({ extensions: ['ts'] })
  ],
  resolve: {
    alias: {
      src: path.resolve('src/'),
    },
  },
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: ['csstype']
  },
  build: {
    target: 'es6',
    outDir: 'lib',
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: path.resolve('src/index.ts'),
      name: '@tonconnect/ui',
      fileName: format => {
        return format === 'es' ? 'index.js' : 'index.umd.js'
      },
    },
  },
});

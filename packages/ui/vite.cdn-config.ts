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
  optimizeDeps: {
    exclude: ['csstype']
  },
  define: {
    'process.env': {}
  },
  build: {
    target: 'es6',
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      format: {
        comments: false
      }
    },
    sourcemap: true,
    lib: {
      formats: ['umd'],
      entry: path.resolve('src/index.ts'),
      name: 'TON_CONNECT_UI',
      fileName: () => 'tonconnect-ui.min.js'
    },
  },
});

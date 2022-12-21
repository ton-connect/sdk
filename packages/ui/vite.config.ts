import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
      solidPlugin({ extensions: ['ts'] }),
      dts({
        skipDiagnostics: true,
        insertTypesEntry: true,
        include: ['./src/ton-connect-ui.ts', './src/models', './src/errors'],
        root: './',
        entryRoot: './src'
      })
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
    /*include: ['@tonconnect/sdk'],*/
    exclude: ['csstype']
  },
  build: {
    target: 'es6',
    outDir: 'lib',
    emptyOutDir: true,
    minify: true,
/*    commonjsOptions: {
      include: [/@tonconnect\/sdk/, /node_modules/],
      transformMixedEsModules: true
    },*/
    lib: {
      entry: path.resolve('src/ton-connect-ui.ts'),
      name: '@tonconnect/ui',
      fileName: format => {
        return format === 'es' ? 'index.js' : 'index.umd.js'
      },
    },
  },
});

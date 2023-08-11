import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite'

export default defineConfig({
  plugins: [
    devtools({
      autoname: true,
    }),
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
  define: {
    'process.env': {}
  },
  build: {
    target: 'es6',
    outDir: 'lib',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      entry: path.resolve('src/index.ts'),
      name: 'TON_CONNECT_UI',
      fileName: format => {
        return format === 'es' ? 'index.js' : 'index.umd.js'
      },
    },
    rollupOptions: {
      external: ['classnames', 'deepmerge', '@tonconnect/sdk', 'ua-parser-js'],
      output: {
        globals: {
          '@tonconnect/sdk': 'TonConnectSDK',
          'deepmerge': 'deepmerge',
          'classnames': 'classNames',
          'ua-parser-js': 'UAParser'
        },
      },
    },
  },
});

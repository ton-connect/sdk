import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
      react(),
      dts({
        insertTypesEntry: true,
      })
  ],
  optimizeDeps: {
    exclude: ['csstype']
  },
  build: {
    target: 'es6',
    outDir: 'lib',
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    lib: {
      entry: path.resolve('src/index.ts'),
      name: '@tonconnect/ui-react',
      fileName: format => {
        return format === 'es' ? 'index.js' : 'index.umd.js'
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        }
      }
    }
  }
})

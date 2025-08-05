import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'docs'
  },
  // @ts-ignore
  base: process.env.GH_PAGES ? '/demo-dapp-with-react-ui/' : './',
  server: {
    fs: {
      allow: ['../sdk', './'],
    },
  },
})

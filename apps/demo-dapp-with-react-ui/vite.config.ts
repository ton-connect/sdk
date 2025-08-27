import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'docs',
        sourcemap: true
    },
    // @ts-ignore
    base: './',
    server: {
        fs: {
            allow: ['../sdk', './']
        }
    }
});

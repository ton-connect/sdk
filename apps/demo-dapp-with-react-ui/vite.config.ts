import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        outDir: 'docs',
        sourcemap: true
    },
    // @ts-ignore
    base: '/',
    server: {
        fs: {
            allow: ['../sdk', './']
        }
    }
});

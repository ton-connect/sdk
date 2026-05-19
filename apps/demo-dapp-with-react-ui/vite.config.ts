import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
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

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'lib'),
            '@components': path.resolve(__dirname, 'lib/components'),
            '@composables': path.resolve(__dirname, 'lib/composables'),
            '@assets': path.resolve(__dirname, 'lib/assets'),
            '@utils': path.resolve(__dirname, 'lib/utils'),
            '@errors': path.resolve(__dirname, 'lib/errors')
        }
    },
    build: {
        target: 'esnext',
        outDir: 'dist',
        emptyOutDir: true,
        minify: true,
        sourcemap: true,
        lib: {
            formats: ['es', 'cjs', 'umd'],
            entry: path.resolve(__dirname, 'lib/index.ts'),
            name: 'TonVue',
            fileName: format => `index.js`
        },
        rollupOptions: {
            external: ['vue', '@tonconnect/ui'],
            output: {
                globals: {
                    vue: 'Vue',
                    '@tonconnect/ui': 'TonConnectUI'
                }
            }
        }
    }
});

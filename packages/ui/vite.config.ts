import * as path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
// @ts-ignore
import * as packageJson from './package.json';

const version = packageJson.version;

export default defineConfig({
    plugins: [
        devtools({
            autoname: true
        }),
        solidPlugin({ extensions: ['ts'] })
    ],
    resolve: {
        alias: {
            src: path.resolve('src/')
        }
    },
    server: {
        port: 3000
    },
    optimizeDeps: {
        exclude: ['csstype']
    },
    define: {
        'process.env': {},
        TON_CONNECT_UI_VERSION: JSON.stringify(version)
    },
    build: {
        target: 'es6',
        outDir: 'lib',
        emptyOutDir: true,
        minify: false,
        sourcemap: true,
        lib: {
            formats: ['es', 'cjs'],
            entry: path.resolve('src/index.ts'),
            name: 'TON_CONNECT_UI',
            fileName: format => {
                switch (format) {
                    case 'es':
                        return 'index.mjs';
                    case 'cjs':
                        return 'index.cjs';
                    default:
                        throw new Error('Unknown format');
                }
            }
        },
        rollupOptions: {
            external: ['classnames', 'deepmerge', '@tonconnect/sdk', 'ua-parser-js'],
            output: {
                globals: {
                    '@tonconnect/sdk': 'TonConnectSDK',
                    deepmerge: 'deepmerge',
                    classnames: 'classNames',
                    'ua-parser-js': 'UAParser'
                }
            }
        }
    }
});

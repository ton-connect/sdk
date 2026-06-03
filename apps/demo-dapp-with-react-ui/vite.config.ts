import type { IncomingMessage, ServerResponse } from 'node:http';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

import { handleFindTransactionDevRequest } from './src/server/dev-find-transaction-handler';

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        {
            name: 'dev-find-transaction-api',
            apply: 'serve',
            configureServer(server) {
                server.middlewares.use(
                    (req: IncomingMessage, res: ServerResponse, next: () => void) => {
                        void handleFindTransactionDevRequest(req, res, next);
                    }
                );
            }
        }
    ],
    resolve: {
        dedupe: ['react', 'react-dom']
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

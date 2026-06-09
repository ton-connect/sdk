import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

import { handleFindTransactionDevRequest } from './src/server/dev-find-transaction-handler';

// https://vitejs.dev/config/

const demoRoot = path.dirname(fileURLToPath(import.meta.url));
const uiRoot = path.resolve(demoRoot, '../../packages/ui');
const uiReactRoot = path.resolve(demoRoot, '../../packages/ui-react');
const previewUseNotifications = path.resolve(
    demoRoot,
    'src/features/widget-builder/utils/preview-use-notifications.ts'
);
const previewNotificationsView = path.resolve(
    demoRoot,
    'src/features/widget-builder/utils/preview-notifications-view.tsx'
);

export default defineConfig({
    define: {
        TON_CONNECT_UI_VERSION: JSON.stringify('preview'),
        'process.env': {}
    },
    optimizeDeps: {
        exclude: ['@tonconnect/ui', '@tonconnect/ui-react']
    },
    plugins: [
        solid({
            include: /\/packages\/ui\/src\/.*\.[tj]sx$/,
            extensions: ['ts', 'tsx']
        }),
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
        dedupe: ['react', 'react-dom', 'solid-js'],
        alias: [
            {
                find: '@tonconnect/ui-react',
                replacement: path.resolve(uiReactRoot, 'src/index.ts')
            },
            {
                find: '@tonconnect/ui',
                replacement: path.resolve(uiRoot, 'src/index.ts')
            },
            {
                find: path.resolve(uiRoot, 'src/app/hooks/use-notifications.ts'),
                replacement: previewUseNotifications
            },
            {
                find: path.resolve(uiRoot, 'src/app/views/account-button/notifications/index.tsx'),
                replacement: previewNotificationsView
            },
            {
                find: /^src\/(.*)$/,
                replacement: path.resolve(uiRoot, 'src/$1')
            }
        ]
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

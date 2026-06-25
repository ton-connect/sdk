import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, type Plugin } from 'vite';
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
const previewTransitionGroupShim = path.resolve(
    demoRoot,
    'src/features/widget-builder/utils/preview-transition-group-shim.ts'
);
const uiNotificationsView = path.resolve(
    uiRoot,
    'src/app/views/account-button/notifications/index.tsx'
);
const UI_USE_NOTIFICATIONS_SPECIFIER = 'src/app/hooks/use-notifications';
const uiUseNotificationsPath = path.resolve(uiRoot, UI_USE_NOTIFICATIONS_SPECIFIER);

function stripQuery(id: string): string {
    const queryIndex = id.indexOf('?');

    return queryIndex === -1 ? id : id.slice(0, queryIndex);
}

/**
 * Vite applies `resolve.alias` before `enforce: 'pre'` plugins, so by the time our
 * resolveId runs, `src/app/hooks/use-notifications` may already be rewritten by the
 * `src/*` alias into an absolute path (with or without extension). Match both forms.
 */
function isUiUseNotificationsSource(source: string): boolean {
    return (
        source === UI_USE_NOTIFICATIONS_SPECIFIER ||
        source === `${UI_USE_NOTIFICATIONS_SPECIFIER}.ts` ||
        source === uiUseNotificationsPath ||
        source === `${uiUseNotificationsPath}.ts`
    );
}

/**
 * Serves @tonconnect/ui from source (see `resolve.alias`) while swapping a couple of its
 * internals for demo-only shims, so widget previews reuse the real ui components instead
 * of keeping patched copies in the demo:
 * - the `use-notifications` hook → single-slot preview implementation that supports
 *   keepalive toasts and external reset (used by the preview iframe page);
 * - `solid-transition-group` imported by the notifications list → passthrough, so a
 *   replaced toast doesn't briefly render twice during the exit animation.
 *
 * Matching by importer (instead of aliasing absolute file paths) keeps the rest of the
 * ui package, including every notification component, resolved from the real source.
 */
function widgetPreviewUiOverrides(): Plugin {
    return {
        name: 'widget-preview-ui-overrides',
        enforce: 'pre',
        resolveId(source, importer) {
            if (!importer) {
                return null;
            }

            const importerPath = stripQuery(importer);

            if (source === 'solid-transition-group' && importerPath === uiNotificationsView) {
                return previewTransitionGroupShim;
            }

            const isUiSourceImporter = importerPath.startsWith(uiRoot + path.sep);

            if (isUiSourceImporter && isUiUseNotificationsSource(stripQuery(source))) {
                return previewUseNotifications;
            }

            return null;
        }
    };
}

export default defineConfig({
    define: {
        TON_CONNECT_UI_VERSION: JSON.stringify('preview'),
        'process.env': {}
    },
    optimizeDeps: {
        exclude: ['@tonconnect/ui', '@tonconnect/ui-react']
    },
    plugins: [
        widgetPreviewUiOverrides(),
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

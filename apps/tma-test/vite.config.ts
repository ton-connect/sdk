import { resolve } from 'path';
import { defineConfig, type Plugin } from 'vite';

function tonconnectManifest(): Plugin {
    const buildManifest = (appUrl: string) =>
        JSON.stringify(
            {
                url: appUrl,
                name: 'TMA Test',
                iconUrl: 'https://tonconnect.github.io/demo-dapp/apple-touch-icon.png'
            },
            null,
            2
        );

    return {
        name: 'tonconnect-manifest',
        configureServer(server) {
            server.middlewares.use('/tonconnect-manifest.json', (_req, res) => {
                const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(buildManifest(appUrl));
            });
        },
        generateBundle() {
            const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
            this.emitFile({
                type: 'asset',
                fileName: 'tonconnect-manifest.json',
                source: buildManifest(appUrl)
            });
        }
    };
}

export default defineConfig({
    base: '/',
    plugins: [tonconnectManifest()],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'index.html')
        }
    },
    server: {
        allowedHosts: true,
        fs: {
            allow: ['../../packages/ui', '../../packages/sdk', './']
        }
    }
});

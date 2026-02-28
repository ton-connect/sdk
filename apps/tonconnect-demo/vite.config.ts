import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

/**
 * Generates tonconnect-manifest.json at build time.
 *
 * Environment variables:
 *   VITE_APP_URL - Full URL (e.g., https://user.github.io/repo/)
 *
 * For local development, defaults to http://localhost:5173
 */
function generateManifest(): Plugin {
    const createManifest = (appUrl: string) => ({
        url: appUrl,
        name: 'TonConnect Demo',
        iconUrl: `${appUrl}/favicon.png`,
        termsOfUseUrl: `${appUrl}/terms-of-use.txt`,
        privacyPolicyUrl: `${appUrl}/privacy-policy.txt`
    });

    return {
        name: 'generate-tonconnect-manifest',
        // Serve dynamic manifest in dev mode
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === '/tonconnect-manifest.json') {
                    const manifest = createManifest('http://localhost:5173');
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(manifest, null, 2));
                    return;
                }
                next();
            });
        },
        // Generate manifest file at build time
        writeBundle(options) {
            const appUrl = (process.env.VITE_APP_URL || 'http://localhost:5173').replace(/\/$/, '');
            const outDir = options.dir || 'dist';

            fs.writeFileSync(
                path.join(outDir, 'tonconnect-manifest.json'),
                JSON.stringify(createManifest(appUrl), null, 2)
            );

            console.log(`Generated tonconnect-manifest.json for ${appUrl}`);
        }
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    // Base path for GitHub Pages deployment (e.g., /repo/ or /repo/branch/)
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), generateManifest()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
        dedupe: ['react', 'react-dom']
    },
    server: {
        allowedHosts: true
    }
});

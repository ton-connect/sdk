import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/** Must match the development URL in `src/app/env/DIAMOND.ts`. */
const DEV_PATH = '/@diamond-model/';
const MODEL_DIR = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../assets/diamond'
);

/**
 * Serves the 3D diamond's model files from the repository, so a development build renders the model
 * in the working tree rather than the one published on `main`.
 */
export function serveDiamondModel(): Plugin {
    return {
        name: 'serve-diamond-model',
        apply: 'serve',
        configureServer(server) {
            server.middlewares.use(DEV_PATH, (req, res, next) => {
                // `basename` keeps the request inside the model folder
                const file = path.join(MODEL_DIR, path.basename(req.url ?? ''));

                if (!file.endsWith('.bin') || !existsSync(file)) {
                    next();
                    return;
                }

                res.setHeader('Content-Type', 'application/octet-stream');
                createReadStream(file).pipe(res);
            });
        }
    };
}

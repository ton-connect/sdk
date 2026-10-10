/// <reference types="vitest" />
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import packageJson from './package.json';

export default defineConfig({
    plugins: [tsconfigPaths()],
    // The library builds replace this constant; tests that import the connector need it too.
    define: {
        TON_CONNECT_SDK_VERSION: JSON.stringify(packageJson.version)
    },
    test: {
        globals: true,
        typecheck: {
            tsconfig: './tsconfig.test.json'
        },
        setupFiles: './tests/setup',
        coverage: {
            provider: 'istanbul'
        }
    }
});

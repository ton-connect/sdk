/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        globals: true,
        typecheck: {
            tsconfig: './tsconfig.test.json'
        },
        setupFiles: './tests/setup'
    },
})

import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'esm',
            file: './lib/esm/index.mjs',
            sourcemap: true
        },
        plugins: [typescript()],
        external: ['@tonconnect/protocol', '@tonconnect/isomorphic-fetch', '@tonconnect/isomorphic-eventsource']
    },
    {
        input: 'src/index.ts',
        output: {
            format: 'cjs',
            file: './lib/cjs/index.cjs',
            sourcemap: true
        },
        plugins: [typescript()],
        external: ['@tonconnect/protocol', '@tonconnect/isomorphic-fetch', '@tonconnect/isomorphic-eventsource']
    }
];

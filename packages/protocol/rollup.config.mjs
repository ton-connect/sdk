import typescript from '@rollup/plugin-typescript';

export default [
    {
        input: 'src/index.ts',
        output: {
            format: 'esm',
            file: './lib/esm/index.mjs',
            sourcemap: true
        },
        plugins: [typescript({ compilerOptions: { declaration: false, declarationDir: undefined } })],
        external: ['tweetnacl', 'tweetnacl-util']
    },
    {
        input: 'src/index.ts',
        output: {
            format: 'cjs',
            file: './lib/cjs/index.cjs',
            sourcemap: true
        },
        plugins: [typescript({ compilerOptions: { declaration: false, declarationDir: undefined } })],
        external: ['tweetnacl', 'tweetnacl-util']
    }
];

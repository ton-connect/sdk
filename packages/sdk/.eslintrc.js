module.exports = {
    extends: ['../../.eslintrc.js'],
    overrides: [
        {
            files: './vite.config.ts',
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: './tsconfig.vite.json',
                tsconfigRootDir: __dirname,
                createDefaultProgram: true
            },
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    allow: ['scope:protocol']
                }
            ]
        }
    ]
};

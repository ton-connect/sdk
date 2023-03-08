module.exports = {
    extends: ["../../.eslintrc.js", 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
    parserOptions: {
        "sourceType": "module",
        "ecmaVersion": "latest",
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: ['react', 'react-hooks'],
    rules: {
        "react/react-in-jsx-scope": "off",
        'import/extensions': ['off'],
        "@typescript-eslint/explicit-function-return-type": [
            'error', {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                allowDirectConstAssertionInArrowFunctions: true
            }
        ],
        "unused-imports/no-unused-vars": [
            "error",
            { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_" }
        ]
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};

module.exports = {
    extends: ["../../.eslintrc.js", 'plugin:react/recommended'],
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
        ]
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
};

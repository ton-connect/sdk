module.exports = {
    extends: ["../../.eslintrc.js", "plugin:solid/typescript"],
    parserOptions: {
        "sourceType": "module",
        "ecmaVersion": 2020,
        ecmaFeatures: {
            jsx: true
        }
    },
    plugins: ["solid"],
    rules: {
        "solid/components-return-once": "error",
        'import/extensions': ['off'],
        "@typescript-eslint/explicit-function-return-type": [
            'error',
            { allowExpressions: true, allowConciseArrowFunctionExpressionsStartingWithVoid: true }
        ]
    }
};

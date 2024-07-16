module.exports = {
    preset: 'ts-jest',
    roots: [
        "src", "tests"
    ],
    moduleDirectories: ['node_modules'],
    testEnvironment: 'node',
    testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {tsconfig: './tsconfig.test.json'},
        ],
    },
    moduleNameMapper: {
        '^src/(.*)$': '<root-dir>/../../src/$1',
        'tests/(.*)$': '<root-dir>/../../tests/$1',
    },
};

/**
 * ESLint Configuration - Migrated from .eslintrc.js
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';
import solidPlugin from 'eslint-plugin-solid';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve('.', '.gitignore');

export default [
  // Ignore .gitignore files/folder in eslint
  includeIgnoreFile(gitignorePath),
  
  // Ignore patterns
  {
    ignores: ['**/*.js', '**/node_modules/**', '**/dist/**', '**/lib/**', '**/types/**'],
  },

  // Base JavaScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'prettier': prettierPlugin,
      'unused-imports': unusedImports,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      // Prettier
      'prettier/prettier': 'error',
      
      // Import rules
      'import/extensions': 'off',
      'import/prefer-default-export': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/export': 0,

      // TypeScript rules
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 2,
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],
      '@typescript-eslint/dot-notation': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-shadow': 'off',
      '@typescript-eslint/return-await': 'off',

      // Unused imports
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'all',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],

      // General rules
      'no-plusplus': 'off',
      'class-method-use-this': 'off',
      'class-methods-use-this': 'off',
      'no-underscore-dangle': 'off',
      'no-inferrable-types': 'off',
      'complexity': ['error', 21],
      'eqeqeq': ['error', 'smart'],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-param-reassign': 'off',
      'max-classes-per-file': 'off',
      'radix': ['warn', 'as-needed'],
      'no-prototype-builtins': 'off',
      'no-return-assign': 'off',
      'no-restricted-globals': 'off',

      // Styling
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],
      'indent': 'off',
      'comma-dangle': ['error', 'never'],

      // Restricted syntax
      'no-restricted-syntax': [
        'error',
        'LabeledStatement',
        'WithStatement',
      ],

      // Console rules
      'no-console': [
        'warn',
        {
          allow: ['debug', 'error', 'info', 'warn'],
        },
      ],
    },
  },

  // Source files with TypeScript project configuration
  {
    files: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.base.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
    },
  },

  // Test files configuration
  {
    files: ['packages/*/tests/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './packages/*/tsconfig.test.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
    },
    rules: {
      // Test-specific rules
      'complexity': ['error', 20], // Lower complexity for tests
      'no-console': 'off', // Allow console in tests
      '@typescript-eslint/explicit-function-return-type': 'off', // Keep required for tests
      '@typescript-eslint/no-explicit-any': 2, // Keep strict
    },
  },

  // SDK Vite config files
  {
    files: ['packages/sdk/vite.config.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './packages/sdk/tsconfig.vite.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
    },
  },

  // UI React Vite config files
  {
    files: ['packages/ui-react/vite.config.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './packages/ui-react/tsconfig.node.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
      },
    },
  },

  // Other Vite config files (UI package and demo app) - without project reference
  {
    files: ['packages/ui/vite.config.ts', 'packages/ui/vite.cdn-config.ts', 'apps/**/vite.config.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },

  // UI Package (Solid.js) specific configuration
  {
    files: ['packages/ui/src/**/*.ts', 'packages/ui/src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'prettier': prettierPlugin,
      'unused-imports': unusedImports,
      'import': importPlugin,
      'solid': solidPlugin,
    },
    rules: {
      'import/extensions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'solid/components-return-once': 'error',
    },
  },

  // UI React Package specific configuration
  {
    files: ['packages/ui-react/src/**/*.ts', 'packages/ui-react/src/**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'prettier': prettierPlugin,
      'unused-imports': unusedImports,
      'import': importPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'import/extensions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        { 
          vars: 'all', 
          varsIgnorePattern: '^_', 
          args: 'after-used', 
          argsIgnorePattern: '^_' 
        }
      ],
      'react/react-in-jsx-scope': 'off',
    },
  },
];

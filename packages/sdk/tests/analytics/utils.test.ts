import { describe, it, expect } from 'vitest';
import { pascalToKebab } from 'src/analytics/utils';

describe.each([
    { input: 'PascalCase', expected: 'pascal-case' },
    { input: 'camelCase', expected: 'camel-case' },
    { input: 'LongPascalCaseExample', expected: 'long-pascal-case-example' },
    { input: 'AlreadyKebab', expected: 'already-kebab' },
    { input: 'Simple', expected: 'simple' },
    { input: '', expected: '' }
])(`analytics/utils: pascalToKebab`, ({ input, expected }) => {
    it(`converts "${input}" to "${expected}"`, () => {
        const result = pascalToKebab(input);
        expect(result).toEqual(expected);
    });
});

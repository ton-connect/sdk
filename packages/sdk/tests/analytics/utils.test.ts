import { describe, it, expect } from 'vitest';
import { pascalToKebab } from 'src/analytics/utils';

describe.each([
    { input: 'PascalCase', expected: 'pascal-case' },
    { input: 'camelCase', expected: 'camel-case' },
    { input: 'LongPascalCaseExample', expected: 'long-pascal-case-example' },
    { input: 'AlreadyKebab', expected: 'already-kebab' },
    { input: 'Simple', expected: 'simple' },
    // Guards the round-trip that names the wire event: the Analytics proxy derives event_name as
    // pascalToKebab(method minus 'emit'), while the type side derives the method via
    // KebabToPascal. If these disagree the event silently lands under the wrong name.
    { input: 'ConnectionInitiated', expected: 'connection-initiated' },
    { input: 'ConnectionLinkGenerated', expected: 'connection-link-generated' },
    { input: 'WalletPreselected', expected: 'wallet-preselected' },
    { input: 'WalletSelected', expected: 'wallet-selected' },
    { input: '', expected: '' }
])(`analytics/utils: pascalToKebab`, ({ input, expected }) => {
    it(`converts "${input}" to "${expected}"`, () => {
        const result = pascalToKebab(input);
        expect(result).toEqual(expected);
    });
});

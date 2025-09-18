import { describe, it, expect } from 'vitest';

import { normalizeBase64 } from 'src/utils/base64';

describe('utils/base64', () => {
    describe('normalizeBase64', () => {
        it('returns undefined when input is not a string', () => {
            expect(normalizeBase64(undefined)).toBeUndefined();
        });

        it('replaces URL-safe chars with standard base64 chars', () => {
            expect(normalizeBase64('te6ccAA-')).toBe('te6ccAA+');
            expect(normalizeBase64('te6cc-_')).toBe('te6cc+/=');
        });

        it('adds padding to make length a multiple of 4', () => {
            expect(normalizeBase64('AQ')).toBe('AQ==');
            expect(normalizeBase64('AQI')).toBe('AQI=');
            expect(normalizeBase64('AQID')).toBe('AQID');
        });

        it('normalize padding in base64', () => {
            expect(normalizeBase64('YWJjZA==')).toBe('YWJjZA==');
            expect(normalizeBase64('YWJjZA=')).toBe('YWJjZA==');
            expect(normalizeBase64('YWJjZA')).toBe('YWJjZA==');
        });
    });
});

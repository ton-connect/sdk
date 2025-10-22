import { describe, it, expect } from 'vitest';

import { enrichUniversalLink } from 'src/app/utils/url-strategy-helpers';

describe.each([
    {
        link: 'https://example.com/wallet/connect',
        params: { traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?trace_id=trace123'
    },
    {
        link: 'https://example.com/wallet/connect',
        params: { sessionId: 'session123', traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?id=session123&trace_id=trace123'
    },
    {
        link: 'https://example.com/wallet/connect',
        params: { sessionId: null, traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?trace_id=trace123'
    },
    {
        link: 'https://example.com/wallet/connect?existing=param',
        params: { traceId: 'trace123', sessionId: 'session123' },
        expected:
            'https://example.com/wallet/connect?existing=param&id=session123&trace_id=trace123'
    },
    {
        link: 'https://example.com/wallet/connect',
        params: { traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?trace_id=trace123'
    },
    {
        link: 'https://t.me/wallet/start',
        params: { traceId: 'trace123' },
        expected: 'https://t.me/wallet/start?startapp=tonconnect-v__2-trace--5Fid__trace123'
    },
    {
        link: 'https://t.me/wallet/start?startapp=tonconnect',
        params: { traceId: 'trace123', sessionId: 'session123' },
        expected:
            'https://t.me/wallet/start?startapp=tonconnect-v__2-id__session123-trace--5Fid__trace123'
    },
    {
        link: 'https://t.me/wallet?attach=wallet',
        params: { traceId: 'trace123', sessionId: 'session123' },
        expected:
            'https://t.me/wallet/start?startapp=tonconnect-v__2-id__session123-trace--5Fid__trace123'
    }
])('enrichUniversalLink', ({ link, params, expected }) => {
    it('should return valid url', () => {
        const result = enrichUniversalLink(link, params);
        expect(result).toBe(expected);
    });
});

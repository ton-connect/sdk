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
        link: 'https://example.com/wallet/connect?trace_id=trace246',
        params: { traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?trace_id=trace246'
    },
    {
        link: 'https://example.com/wallet/connect?id=session246&trace_id=trace246',
        params: { sessionId: 'session123', traceId: 'trace123' },
        expected: 'https://example.com/wallet/connect?id=session246&trace_id=trace246'
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
    },
    {
        link: 'https://t.me/wallet/start?startapp=tonconnect-v__2-id__ccf67f691306f64a6ad690facfef8c8e6a6a020ec8997019ae01a91eac490872-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Ftonconnect--2Dsdk--2Ddemo--2Ddapp--2Evercel--2Eapp--2Ftonconnect--2Dmanifest--2Ejson--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--2C--7B--22name--22--3A--22ton--5Fproof--22--2C--22payload--22--3A--22865f264e46f69ffcc9c8464ff4ee7b446d5caa9058f93bd7748a1c1505a51dbf--22--7D--5D--7D-ret__none',
        params: {
            traceId: '019a3107-22f1-713c-9496-14904c306ba8',
            sessionId: 'ccf67f691306f64a6ad690facfef8c8e6a6a020ec8997019ae01a91eac490872'
        },
        expected:
            'https://t.me/wallet/start?startapp=tonconnect-v__2-id__ccf67f691306f64a6ad690facfef8c8e6a6a020ec8997019ae01a91eac490872-trace--5Fid__019a3107--2D22f1--2D713c--2D9496--2D14904c306ba8-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Ftonconnect--2Dsdk--2Ddemo--2Ddapp--2Evercel--2Eapp--2Ftonconnect--2Dmanifest--2Ejson--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--2C--7B--22name--22--3A--22ton--5Fproof--22--2C--22payload--22--3A--22865f264e46f69ffcc9c8464ff4ee7b446d5caa9058f93bd7748a1c1505a51dbf--22--7D--5D--7D-ret__none'
    },
    {
        link: 'https://t.me/wallet/start?startapp=tonconnect-v__2-id__ccf67f691306f64a6ad690facfef8c8e6a6a020ec8997019ae01a91eac490872-trace--5Fid__019a3107--2D22f1--2D713c--2D9496--2D14904c306ba8-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Ftonconnect--2Dsdk--2Ddemo--2Ddapp--2Evercel--2Eapp--2Ftonconnect--2Dmanifest--2Ejson--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--2C--7B--22name--22--3A--22ton--5Fproof--22--2C--22payload--22--3A--22865f264e46f69ffcc9c8464ff4ee7b446d5caa9058f93bd7748a1c1505a51dbf--22--7D--5D--7D-ret__none',
        params: {
            traceId: '019a349b-ad98-7171-9a87-68c95e7e7515'
        },
        expected:
            'https://t.me/wallet/start?startapp=tonconnect-v__2-id__ccf67f691306f64a6ad690facfef8c8e6a6a020ec8997019ae01a91eac490872-trace--5Fid__019a3107--2D22f1--2D713c--2D9496--2D14904c306ba8-r__--7B--22manifestUrl--22--3A--22https--3A--2F--2Ftonconnect--2Dsdk--2Ddemo--2Ddapp--2Evercel--2Eapp--2Ftonconnect--2Dmanifest--2Ejson--22--2C--22items--22--3A--5B--7B--22name--22--3A--22ton--5Faddr--22--7D--2C--7B--22name--22--3A--22ton--5Fproof--22--2C--22payload--22--3A--22865f264e46f69ffcc9c8464ff4ee7b446d5caa9058f93bd7748a1c1505a51dbf--22--7D--5D--7D-ret__none'
    }
])('enrichUniversalLink', ({ link, params, expected }) => {
    it('should return valid url', () => {
        const result = enrichUniversalLink(link, params);
        expect(result).toBe(expected);
    });
});

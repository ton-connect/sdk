import { describe, it, expect } from 'vitest';
import vm from 'node:vm';

import { legacyWalletErrorFrom } from 'src/errors/wallet-response/legacy-wallet-error';

const RPC = new Set([0, 1, 100, 300, 400]);
const CONNECT = new Set([0, 1, 2, 3, 100, 300, 400]);

const throwingGetter = Object.defineProperty({}, 'message', {
    get() {
        throw new Error('boom');
    }
});

describe('legacyWalletErrorFrom', () => {
    it.each([
        ['Error("300")', new Error('300'), { code: 300, message: '300' }],
        ['Error("400")', new Error('400'), { code: 400, message: '400' }],
        ['Error("0")', new Error('0'), { code: 0, message: '0' }],
        ['bare 300', 300, { code: 300, message: '' }],
        ['plain {code, message}', { code: 300, message: 'no' }, { code: 300, message: 'no' }],
        ['plain {code} without message', { code: 1 }, { code: 1, message: '' }],
        [
            'plain {error: {code, message, data}}',
            { error: { code: 300, message: 'no', data: { a: 1 } } },
            { code: 300, message: 'no', data: { a: 1 } }
        ],
        [
            'cross-realm Error("300")',
            vm.runInNewContext('new Error("300")'),
            { code: 300, message: '300' }
        ],
        [
            'cross-realm plain {code}',
            vm.runInNewContext('({ code: 300 })'),
            { code: 300, message: '' }
        ]
    ])('normalizes %s', (_name, reason, expected) => {
        expect(legacyWalletErrorFrom(reason, RPC)).toEqual(expected);
    });

    it.each([
        ['Error("999")', new Error('999')],
        ['Error("01")', new Error('01')],
        ['Error("-300")', new Error('-300')],
        ['Error("300.0")', new Error('300.0')],
        ['Error(" 300")', new Error(' 300')],
        ['localized text', new Error('Отменено пользователем')],
        ['string "300"', '300'],
        ['NaN', NaN],
        ['Infinity', Infinity],
        ['300.5', 300.5],
        ['-300', -300],
        ['DOMException("300", "AbortError")', new DOMException('300', 'AbortError')],
        ['DOMException NotAllowedError (code 0)', new DOMException('x', 'NotAllowedError')],
        ['plain {code: "300"}', { code: '300', message: 'x' }],
        ['plain {code: 999}', { code: 999 }],
        ['Error with numeric code property', Object.assign(new Error('boom'), { code: 300 })],
        ['null', null],
        ['undefined', undefined],
        ['throwing message getter', throwingGetter],
        ['connect-only code 2 on RPC', { code: 2 }]
    ])('rejects %s', (_name, reason) => {
        expect(legacyWalletErrorFrom(reason, RPC)).toBeUndefined();
    });

    it('accepts connect-only codes with the connect table', () => {
        expect(legacyWalletErrorFrom({ code: 2 }, CONNECT)).toEqual({ code: 2, message: '' });
    });

    it('does not copy an absent data key', () => {
        expect(legacyWalletErrorFrom({ code: 300 }, RPC)).not.toHaveProperty('data');
    });
});

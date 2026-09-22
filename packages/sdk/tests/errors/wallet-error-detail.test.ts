import { describe, it, expect } from 'vitest';

import {
    MethodNotSupportedError,
    TonConnectError,
    UserRejectsError,
    WalletTransportError
} from 'src/errors';

describe('walletError on TonConnectError', () => {
    it('keeps the wallet error detail as a non-enumerable property', () => {
        const detail = { code: 300, message: 'declined', data: { reason: 1 }, responseId: '7' };
        const error = new UserRejectsError('declined', { walletError: detail });

        expect(error.walletError).toEqual(detail);
        expect(Object.keys(error)).not.toContain('walletError');
    });

    it('has no walletError when not built from a wallet payload', () => {
        const error = new TonConnectError('x');

        expect(error.walletError).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(error, 'walletError')).toBe(false);
    });

    it('exports MethodNotSupportedError and WalletTransportError as TonConnectErrors', () => {
        expect(new MethodNotSupportedError()).toBeInstanceOf(TonConnectError);
        expect(new MethodNotSupportedError().message).toContain(
            'Wallet does not support the requested method.'
        );
        expect(new WalletTransportError('x', { cause: 'raw' }).cause).toBe('raw');
        expect(new WalletTransportError().message).toContain(
            'Request to the wallet failed without a TON Connect response.'
        );
    });
});

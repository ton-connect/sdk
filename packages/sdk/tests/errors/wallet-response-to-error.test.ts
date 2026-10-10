import { describe, it, expect } from 'vitest';

import {
    BadRequestError,
    MethodNotSupportedError,
    TonConnectError,
    UnknownAppError,
    UnknownError,
    UserRejectsError,
    WalletTransportError
} from 'src/errors';
// Not re-exported from the package barrel; the factory imports them the same way.
import { ManifestContentErrorError } from 'src/errors/protocol/events/connect/manifest-content-error.error';
import { ManifestNotFoundError } from 'src/errors/protocol/events/connect/manifest-not-found.error';
import { attachError, markNormalized } from 'src/errors/wallet-response/marks';
import {
    CONNECT_WALLET_ERROR_CODES,
    CONNECT_WALLET_ERRORS,
    RPC_WALLET_ERROR_CODES,
    RPC_WALLET_ERRORS,
    walletResponseToError
} from 'src/errors/wallet-response/wallet-response-to-error';

describe('walletResponseToError', () => {
    it.each([
        [0, UnknownError],
        [1, BadRequestError],
        [100, UnknownAppError],
        [300, UserRejectsError],
        [400, MethodNotSupportedError],
        [999, UnknownError]
    ])('maps RPC code %i', (code, ErrorClass) => {
        const error = walletResponseToError({ code, message: 'm' }, RPC_WALLET_ERRORS);

        expect(error).toBeInstanceOf(ErrorClass);
        expect(error.message.endsWith('\nm')).toBe(true);
        expect(error.walletError).toEqual({ code, message: 'm' });
    });

    it.each([
        [0, UnknownError],
        [1, BadRequestError],
        [2, ManifestNotFoundError],
        [3, ManifestContentErrorError],
        [100, UnknownAppError],
        [300, UserRejectsError],
        [400, MethodNotSupportedError]
    ])('maps connect code %i', (code, ErrorClass) => {
        expect(walletResponseToError({ code, message: 'm' }, CONNECT_WALLET_ERRORS)).toBeInstanceOf(
            ErrorClass
        );
    });

    it('exposes the known codes of each table', () => {
        expect([...RPC_WALLET_ERROR_CODES].sort((a, b) => a - b)).toEqual([0, 1, 100, 300, 400]);
        expect([...CONNECT_WALLET_ERROR_CODES].sort((a, b) => a - b)).toEqual([
            0, 1, 2, 3, 100, 300, 400
        ]);
    });

    it('keeps data, response id and the normalized mark', () => {
        const payload = { code: 300, message: '', data: { step: 2 } };
        markNormalized(payload);

        const error = walletResponseToError(payload, RPC_WALLET_ERRORS, { responseId: '5' });

        expect(error.walletError).toEqual({
            code: 300,
            message: '',
            data: { step: 2 },
            responseId: '5',
            normalized: true
        });
    });

    it('uses an empty message when the wallet sent none', () => {
        expect(walletResponseToError({ code: 1 }, RPC_WALLET_ERRORS).walletError).toEqual({
            code: 1,
            message: ''
        });
    });

    it('returns the attached error unchanged', () => {
        const payload = { code: 0, message: 'x' };
        const attached = new WalletTransportError('x');
        attachError(payload, attached);

        expect(walletResponseToError(payload, CONNECT_WALLET_ERRORS)).toBe(attached);
    });

    it('returns TonConnectError subclasses only', () => {
        expect(walletResponseToError({ code: 300 }, RPC_WALLET_ERRORS)).toBeInstanceOf(
            TonConnectError
        );
    });
});

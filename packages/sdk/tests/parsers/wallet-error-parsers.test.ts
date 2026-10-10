import { describe, it, expect } from 'vitest';

import { MethodNotSupportedError, UserRejectsError } from 'src/errors';
import { markNormalized } from 'src/errors/wallet-response/marks';
import { connectErrorsParser } from 'src/parsers/connect-errors-parser';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { signDataParser } from 'src/parsers/sign-data-parser';
import { signMessageParser } from 'src/parsers/sign-message-parser';

const parsers = [
    ['sendTransaction', sendTransactionParser],
    ['signData', signDataParser],
    ['signMessage', signMessageParser]
] as const;

function thrownBy(fn: () => unknown): unknown {
    try {
        fn();
    } catch (e) {
        return e;
    }
    throw new Error('expected a throw');
}

describe.each(parsers)('%s parser', (_name, parser) => {
    it('maps 400 keeping data and the response id', () => {
        const response = { id: '9', error: { code: 400, message: 'nope', data: { m: 1 } } };
        const error = thrownBy(() =>
            parser.parseAndThrowError(response as never)
        ) as MethodNotSupportedError;

        expect(error).toBeInstanceOf(MethodNotSupportedError);
        expect(error.walletError).toEqual({
            code: 400,
            message: 'nope',
            data: { m: 1 },
            responseId: '9'
        });
    });

    it('carries the normalized mark of the error payload', () => {
        const response = { id: '3', error: { code: 300, message: '300' } };
        markNormalized(response.error);
        const error = thrownBy(() =>
            parser.parseAndThrowError(response as never)
        ) as UserRejectsError;

        expect(error).toBeInstanceOf(UserRejectsError);
        expect(error.walletError).toEqual({
            code: 300,
            message: '300',
            responseId: '3',
            normalized: true
        });
    });

    it('omits the response id when the response has none', () => {
        const error = thrownBy(() =>
            parser.parseAndThrowError({ error: { code: 300, message: '' } } as never)
        ) as UserRejectsError;

        expect(error.walletError).toEqual({ code: 300, message: '' });
    });
});

describe('connect errors parser', () => {
    it('maps connect 400 keeping the wallet error', () => {
        const error = connectErrorsParser.parseError({ code: 400, message: 'x' } as never);

        expect(error).toBeInstanceOf(MethodNotSupportedError);
        expect(error.walletError).toEqual({ code: 400, message: 'x' });
    });
});

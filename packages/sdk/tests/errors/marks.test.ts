import { describe, it, expect } from 'vitest';

import { TonConnectError } from 'src/errors';
import {
    attachError,
    attachedErrorOf,
    isNormalized,
    markNormalized
} from 'src/errors/wallet-response/marks';

describe('wallet payload marks', () => {
    it('survive a top-level spread of the envelope but not a clone of the payload', () => {
        const payload = { code: 300, message: '' };
        markNormalized(payload);
        const envelope = { ...{ event: 'connect_error', payload }, traceId: 't' };

        expect(isNormalized(envelope.payload)).toBe(true);
        expect(isNormalized({ ...payload })).toBe(false);
    });

    it('stay out of the payload keys and JSON form', () => {
        const payload = { code: 300, message: '' };
        markNormalized(payload);

        expect(Object.keys(payload)).toEqual(['code', 'message']);
        expect(JSON.stringify(payload)).toBe('{"code":300,"message":""}');
    });

    it('return the attached error', () => {
        const payload = { code: 0, message: 'x' };
        const error = new TonConnectError('x');
        attachError(payload, error);

        expect(attachedErrorOf(payload)).toBe(error);
        expect(attachedErrorOf({ code: 0, message: 'x' })).toBeUndefined();
    });
});

import { describe, it, expect } from 'vitest';

import {
    validateSendTransactionRequest,
    validateConnectAdditionalRequest,
    validateSignDataPayload,
    validateTonProofItemReply
} from 'src/validation/schemas';
import { toUserFriendlyAddress } from 'src/utils/address';

const RAW_ADDRESS = '0:' + 'a'.repeat(64);
const USER_FRIENDLY_ADDRESS = toUserFriendlyAddress(RAW_ADDRESS);
// Must match BASE64 regex and start with 'te6cc'. Keep length divisible by 4.
const VALID_BOC = 'te6ccAAA';

describe('validation/schemas', () => {
    describe('validateSendTransactionRequest', () => {
        it('accepts a valid request', () => {
            const result = validateSendTransactionRequest({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                network: '0',
                from: RAW_ADDRESS,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1000',
                        stateInit: VALID_BOC,
                        payload: VALID_BOC,
                        extraCurrency: { 100: '1' }
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('accepts a valid request with friendly format from', () => {
            const result = validateSendTransactionRequest({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                network: '0',
                from: USER_FRIENDLY_ADDRESS,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1000',
                        stateInit: VALID_BOC,
                        payload: VALID_BOC,
                        extraCurrency: { 100: '1' }
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('returns error for non-object input', () => {
            const result = validateSendTransactionRequest(null as unknown);
            expect(result).toBe('Request must be an object');
        });

        it('returns error by default when QA mode is disabled', () => {
            const result = validateSendTransactionRequest({} as unknown);
            expect(result).toBe("Incorrect 'validUntil'");
        });

        it('detects extra top-level properties', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [],
                extra: true
            } as unknown);
            expect(result).toBe('Request contains extra properties');
        });

        it('requires validUntil to be a number', () => {
            const result = validateSendTransactionRequest({
                validUntil: 'x',
                messages: []
            } as unknown);
            expect(result).toBe("Incorrect 'validUntil'");
        });

        it('validates network format when provided', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: 'abc',
                messages: []
            } as unknown);
            expect(result).toBe("Invalid 'network' format");
        });

        it('validates from raw address when provided', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                from: 'bad',
                messages: []
            } as unknown);
            expect(result).toBe("Invalid 'from' address format");
        });

        it('requires non-empty messages', () => {
            const result1 = validateSendTransactionRequest({ validUntil: 1 } as unknown);
            expect(result1).toBe("'messages' is required");
            const result2 = validateSendTransactionRequest({
                validUntil: 1,
                messages: []
            } as unknown);
            expect(result2).toBe("'messages' is required");
        });

        it('rejects non-object message', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: ['oops']
            } as unknown);
            expect(result).toBe('Message at index 0 must be an object');
        });

        it('rejects message with extra properties', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        unknown: true
                    } as unknown as Record<string, unknown>
                ]
            } as unknown);
            expect(result).toBe('Message at index 0 contains extra properties');
        });

        it('validates message address format', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [
                    {
                        address: 'not-friendly',
                        amount: '1'
                    }
                ]
            } as unknown);
            expect(result).toBe("Wrong 'address' format in message at index 0");
        });

        it('validates message amount as numeric string', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1x'
                    }
                ]
            } as unknown);
            expect(result).toBe("Incorrect 'amount' in message at index 0");
        });

        it('validates optional BOCs (stateInit, payload)', () => {
            const badStateInit = 'abc';
            const badPayload = 'def';
            const result1 = validateSendTransactionRequest({
                validUntil: 1,
                messages: [{ address: USER_FRIENDLY_ADDRESS, amount: '1', stateInit: badStateInit }]
            } as unknown);
            expect(result1).toBe("Invalid 'stateInit' in message at index 0");

            const result2 = validateSendTransactionRequest({
                validUntil: 1,
                messages: [{ address: USER_FRIENDLY_ADDRESS, amount: '1', payload: badPayload }]
            } as unknown);
            expect(result2).toBe("Invalid 'payload' in message at index 0");
        });

        it('validates extraCurrency map format', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        extraCurrency: { x: '1' } as unknown as { [k: number]: string }
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'extraCurrency' format in message at index 0");
        });
    });

    describe('validateConnectAdditionalRequest', () => {
        it('accepts empty object (no tonProof)', () => {
            expect(validateConnectAdditionalRequest({})).toBeNull();
        });

        it('accepts valid tonProof string', () => {
            expect(validateConnectAdditionalRequest({ tonProof: 'proof' })).toBeNull();
        });

        it('rejects non-object and wrong types', () => {
            expect(validateConnectAdditionalRequest(null as unknown)).toBe(
                'Request must be an object'
            );
            expect(validateConnectAdditionalRequest({ tonProof: 1 } as unknown)).toBe(
                "Invalid 'tonProof'"
            );
        });
    });

    describe('validateSignDataPayload', () => {
        it('validates text payload', () => {
            expect(
                validateSignDataPayload({ type: 'text', text: 'hello', network: '0', from: 'me' })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'text', text: 'hello', network: 'abc' } as unknown)
            ).toBe("Invalid 'network' format");

            expect(
                validateSignDataPayload({ type: 'text', text: 'hello', from: 1 } as unknown)
            ).toBe("Invalid 'from'");
        });

        it('validates binary payload', () => {
            expect(
                validateSignDataPayload({ type: 'binary', bytes: 'AA==', network: '1', from: 'x' })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'binary', bytes: 'AA==', network: 'x' } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('validates cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: '0',
                    from: 'x'
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'cell', schema: 'v1', cell: 'bad' } as unknown)
            ).toBe("Invalid 'cell' format (must be valid base64)");
        });

        it('rejects unknown payload type', () => {
            expect(
                validateSignDataPayload({ type: 'oops', any: 'x' } as unknown as Record<
                    string,
                    unknown
                >)
            ).toBe("Invalid 'type' value");
        });
    });

    describe('validateTonProofItemReply', () => {
        it('accepts valid proof object', () => {
            const result = validateTonProofItemReply({
                proof: {
                    timestamp: Math.floor(Date.now() / 1000),
                    domain: { lengthBytes: 11, value: 'example.com' },
                    payload: 'some-payload',
                    signature: 'YWJjZA=='
                }
            });
            expect(result).toBeNull();
        });

        it('accepts valid error object', () => {
            const result = validateTonProofItemReply({ error: { code: 1, message: 'oops' } });
            expect(result).toBeNull();
        });

        it('requires either proof or error', () => {
            const result = validateTonProofItemReply({});
            expect(result).toBe("'ton_proof' item must contain either 'proof' or 'error'");
        });

        it('rejects extra properties at any level', () => {
            expect(validateTonProofItemReply({ x: 1 } as unknown as Record<string, unknown>)).toBe(
                'ton_proof item contains extra properties'
            );

            expect(
                validateTonProofItemReply({
                    proof: {
                        timestamp: 1,
                        domain: { lengthBytes: 1, value: 'a' },
                        payload: 'p',
                        signature: 'QQ==',
                        x: 1
                    } as unknown as Record<string, unknown>
                })
            ).toBe('ton_proof item contains extra properties');

            expect(
                validateTonProofItemReply({
                    error: { code: 1, message: 'm', x: 1 } as unknown as Record<string, unknown>
                })
            ).toBe('ton_proof error contains extra properties');
        });

        it('validates domain lengthBytes equals actual bytes length', () => {
            const result = validateTonProofItemReply({
                proof: {
                    timestamp: 1,
                    domain: { lengthBytes: 5, value: 'abc' },
                    payload: 'p',
                    signature: 'QQ=='
                }
            });
            expect(result).toBe("'proof.domain.lengthBytes' does not match 'proof.domain.value'");
        });

        it('validates signature is base64', () => {
            const result = validateTonProofItemReply({
                proof: {
                    timestamp: 1,
                    domain: { lengthBytes: 3, value: 'abc' },
                    payload: 'p',
                    signature: 'not-base64'
                }
            });
            expect(result).toBe("Invalid 'proof.signature' format");
        });
    });
});

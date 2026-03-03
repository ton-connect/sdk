import { describe, it, expect } from 'vitest';

import { CHAIN } from '@tonconnect/protocol';
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
const VALID_BOC_URLSAFE = 'te6cc-_';

describe('validation/schemas', () => {
    describe('validateSendTransactionRequest', () => {
        it('accepts a valid request', () => {
            const result = validateSendTransactionRequest({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                network: CHAIN.MAINNET,
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

        it('accepts base64url for stateInit and payload', () => {
            const result = validateSendTransactionRequest({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1000',
                        stateInit: VALID_BOC_URLSAFE,
                        payload: VALID_BOC_URLSAFE
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('accepts a valid request with friendly format from', () => {
            const result = validateSendTransactionRequest({
                validUntil: Math.floor(Date.now() / 1000) + 60,
                network: CHAIN.MAINNET,
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

        it('accepts undefined values for optional fields', () => {
            const result = validateSendTransactionRequest({
                validUntil: undefined,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: undefined
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('accepts undefined values for optional message fields', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: undefined
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('rejects null value for network field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: null,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: undefined
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'network' format");
        });

        it('rejects null value for from field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: null,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: undefined
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'from' address format");
        });

        it('rejects null value for stateInit field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: null,
                        payload: undefined,
                        extraCurrency: undefined
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'stateInit' in message at index 0");
        });

        it('rejects null value for payload field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: null,
                        extraCurrency: undefined
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'payload' in message at index 0");
        });

        it('rejects null value for extraCurrency field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: null
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'extraCurrency' in message at index 0");
        });

        it('rejects empty strings for network field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: '',
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: {}
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'network' format");
        });

        it('rejects empty strings for from field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: '',
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: undefined,
                        extraCurrency: {}
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'from' address format");
        });

        it('rejects empty strings for stateInit field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: '',
                        payload: undefined,
                        extraCurrency: {}
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'stateInit' in message at index 0");
        });

        it('rejects empty strings for payload field', () => {
            const result = validateSendTransactionRequest({
                validUntil: 1,
                network: undefined,
                from: undefined,
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1',
                        stateInit: undefined,
                        payload: '',
                        extraCurrency: {}
                    }
                ]
            } as unknown);
            expect(result).toBe("Invalid 'payload' in message at index 0");
        });

        it('accepts omitted optional fields', () => {
            const result = validateSendTransactionRequest({
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1'
                    }
                ]
            });
            expect(result).toBeNull();
        });

        it('accepts long validUntil, but logs warning', () => {
            const result = validateSendTransactionRequest({
                validUntil: Date.now(),
                messages: [
                    {
                        address: USER_FRIENDLY_ADDRESS,
                        amount: '1'
                    }
                ]
            });
            expect(result).toBeNull();
        });
    });

    describe('validateConnectAdditionalRequest', () => {
        it('accepts empty object (no tonProof)', () => {
            expect(validateConnectAdditionalRequest({})).toBeNull();
        });

        it('accepts valid tonProof string', () => {
            expect(validateConnectAdditionalRequest({ tonProof: 'proof' })).toBeNull();
        });

        it('accepts undefined tonProof', () => {
            expect(validateConnectAdditionalRequest({ tonProof: undefined })).toBeNull();
        });

        it('rejects null tonProof', () => {
            expect(validateConnectAdditionalRequest({ tonProof: null } as unknown)).toBe(
                "Invalid 'tonProof'"
            );
        });

        it('rejects empty string tonProof', () => {
            expect(validateConnectAdditionalRequest({ tonProof: '' } as unknown)).toBe(
                "Empty 'tonProof' payload"
            );
        });

        it('accepts omitted tonProof field', () => {
            expect(validateConnectAdditionalRequest({})).toBeNull();
        });

        it('rejects non-object and wrong types', () => {
            expect(validateConnectAdditionalRequest(null as unknown)).toBe(
                'Request must be an object'
            );
            expect(validateConnectAdditionalRequest({ tonProof: 1 } as unknown)).toBe(
                "Invalid 'tonProof'"
            );
        });

        describe('tonProof size validation', () => {
            let originalWindow: typeof window;

            beforeEach(() => {
                originalWindow = global.window;
                // Mock window.location for testing
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'example.com'
                    }
                } as Window;
            });

            afterEach(() => {
                global.window = originalWindow;
            });

            it('rejects tonProof payload exceeding 128 bytes', () => {
                const longPayload = 'a'.repeat(129);
                expect(validateConnectAdditionalRequest({ tonProof: longPayload })).toBe(
                    "'tonProof' payload exceeds 128 bytes limit"
                );
            });

            it('accepts tonProof payload exactly 128 bytes', () => {
                const exactPayload = 'a'.repeat(128);
                expect(validateConnectAdditionalRequest({ tonProof: exactPayload })).toBeNull();
            });

            it('rejects when domain + payload exceeds 222 bytes', () => {
                // example.com = 11 bytes, so payload can be max 211 bytes
                // But payload must not exceed 128 bytes, so we test with a payload that's within 128 bytes
                // but when combined with domain exceeds 222 bytes
                const longPayload = 'a'.repeat(128); // Exactly 128 bytes
                // Mock a domain that's 95 bytes (128 + 95 = 223 > 222)
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'a'.repeat(95)
                    }
                } as Window;

                expect(validateConnectAdditionalRequest({ tonProof: longPayload })).toBe(
                    "'tonProof' domain + payload exceeds 222 bytes limit"
                );
            });

            it('accepts when domain + payload equals 222 bytes', () => {
                // example.com = 11 bytes, so payload can be max 211 bytes
                // But payload must not exceed 128 bytes, so we test with a payload that's within 128 bytes
                // and when combined with domain equals 222 bytes
                const exactPayload = 'a'.repeat(128); // Exactly 128 bytes
                // Mock a domain that's 94 bytes (128 + 94 = 222)
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'a'.repeat(94)
                    }
                } as Window;

                expect(validateConnectAdditionalRequest({ tonProof: exactPayload })).toBeNull();
            });

            it('rejects when domain exceeds 128 bytes', () => {
                // Mock a very long domain
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'a'.repeat(129)
                    }
                } as Window;

                expect(validateConnectAdditionalRequest({ tonProof: 'test' })).toBe(
                    'Current domain exceeds 128 bytes limit'
                );
            });

            it('works with very long domain and small payload', () => {
                // Mock a domain that's exactly 128 bytes
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'a'.repeat(128)
                    }
                } as Window;

                // Payload can be max 94 bytes (222 - 128)
                const smallPayload = 'a'.repeat(94);
                expect(validateConnectAdditionalRequest({ tonProof: smallPayload })).toBeNull();
            });

            it('rejects when domain is 128 bytes and payload is 95 bytes', () => {
                // Mock a domain that's exactly 128 bytes
                // @ts-ignore
                global.window = {
                    location: {
                        hostname: 'a'.repeat(128)
                    }
                } as Window;

                // Payload is 95 bytes, total would be 223 bytes (exceeds 222)
                const payload = 'a'.repeat(95);
                expect(validateConnectAdditionalRequest({ tonProof: payload })).toBe(
                    "'tonProof' domain + payload exceeds 222 bytes limit"
                );
            });
        });
    });

    describe('validateSignDataPayload', () => {
        it('validates text payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello',
                    network: CHAIN.MAINNET,
                    from: RAW_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello',
                    network: CHAIN.MAINNET,
                    from: USER_FRIENDLY_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'text', text: 'hello', network: 'abc' } as unknown)
            ).toBe("Invalid 'network' format");

            expect(
                validateSignDataPayload({ type: 'text', text: 'hello', from: 1 } as unknown)
            ).toBe("Invalid 'from'");
        });

        it('accepts undefined values for optional fields in text payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello',
                    network: undefined,
                    from: undefined
                })
            ).toBeNull();
        });

        it('rejects null values for optional fields in text payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello',
                    network: null,
                    from: null
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('rejects empty strings for optional fields in text payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello',
                    network: '',
                    from: ''
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('accepts omitted optional fields in text payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'text',
                    text: 'hello'
                })
            ).toBeNull();
        });

        it('validates binary payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA==',
                    network: '1',
                    from: USER_FRIENDLY_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA==',
                    network: '1',
                    from: RAW_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'binary', bytes: 'AA==', network: 'x' } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('accepts undefined values for optional fields in binary payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA==',
                    network: undefined,
                    from: undefined
                })
            ).toBeNull();
        });

        it('rejects null values for optional fields in binary payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA==',
                    network: null,
                    from: null
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('rejects empty strings for optional fields in binary payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA==',
                    network: '',
                    from: ''
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('accepts omitted optional fields in binary payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'binary',
                    bytes: 'AA=='
                })
            ).toBeNull();
        });

        it('validates cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: '0',
                    from: RAW_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: '0',
                    from: USER_FRIENDLY_ADDRESS
                })
            ).toBeNull();

            expect(
                validateSignDataPayload({ type: 'cell', schema: 'v1', cell: 'bad' } as unknown)
            ).toBe("Invalid 'cell' format (must be valid base64)");
        });

        it('accepts base64url for cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC_URLSAFE,
                    network: '0',
                    from: RAW_ADDRESS
                })
            ).toBeNull();
        });

        it('accepts undefined values for optional fields in cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: undefined,
                    from: undefined
                })
            ).toBeNull();
        });

        it('rejects null values for optional fields in cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: null,
                    from: null
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('rejects empty strings for optional fields in cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC,
                    network: '',
                    from: ''
                } as unknown)
            ).toBe("Invalid 'network' format");
        });

        it('accepts omitted optional fields in cell payload', () => {
            expect(
                validateSignDataPayload({
                    type: 'cell',
                    schema: 'v1',
                    cell: VALID_BOC
                })
            ).toBeNull();
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

        it('rejects when both proof and error are present', () => {
            const result = validateTonProofItemReply({
                proof: {
                    timestamp: Math.floor(Date.now() / 1000),
                    domain: { lengthBytes: 11, value: 'example.com' },
                    payload: 'some-payload',
                    signature: 'YWJjZA=='
                },
                error: { code: 1, message: 'oops' }
            });
            expect(result).toBe(
                "'ton_proof' item must contain either 'proof' or 'error', not both"
            );
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

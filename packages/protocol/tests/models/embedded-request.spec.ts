import { Base64 } from 'src/utils';
import {
    EmbeddedWireRequest,
    EmbeddedWireSendTransaction,
    EmbeddedWireSignMessage,
    EmbeddedWireSignData,
    parseEmbeddedRequest,
    expandEmbeddedWireRequest,
    ParsedEmbeddedRequest
} from 'src/models';

function toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeReqParam(wire: EmbeddedWireRequest): string {
    return toBase64Url(Base64.encode(JSON.stringify(wire), false));
}

describe('expandEmbeddedWireRequest', () => {
    it('expands a sendTransaction with messages', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            n: '-239',
            vu: 1761071945,
            ms: [{ a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', am: '1000000000' }]
        };

        const result = expandEmbeddedWireRequest(wire);
        expect(result.method).toBe('sendTransaction');

        const payload = JSON.parse(result.params[0]);
        expect(payload).toEqual({
            valid_until: 1761071945,
            network: '-239',
            messages: [
                {
                    address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    amount: '1000000000'
                }
            ]
        });
    });

    it('expands a sendTransaction with messages including payload and stateInit', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            ms: [
                {
                    a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    am: '500000000',
                    p: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
                    si: 'te6cckEBAQEABgAACAAAAABT+rFy',
                    ec: { 239: '100' }
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.messages[0]).toEqual({
            address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            amount: '500000000',
            payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
            stateInit: 'te6cckEBAQEABgAACAAAAABT+rFy',
            extra_currency: { '239': '100' }
        });
    });

    it('expands a sendTransaction with ton items', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            i: [
                {
                    t: 'ton',
                    a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    am: '1000000000',
                    p: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo'
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.items).toEqual([
            {
                type: 'ton',
                address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                amount: '1000000000',
                payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo'
            }
        ]);
        expect(payload.messages).toBeUndefined();
    });

    it('expands jetton items with all optional fields', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            n: '-239',
            vu: 1761071945,
            i: [
                {
                    t: 'jetton',
                    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    d: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    am: '10000000',
                    aa: '50000000',
                    rd: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    cp: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
                    fa: '50',
                    fp: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
                    qi: '42'
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.items[0]).toEqual({
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            destination: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
            amount: '10000000',
            attach_amount: '50000000',
            response_destination: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            custom_payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
            forward_amount: '50',
            forward_payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
            query_id: '42'
        });
    });

    it('expands jetton items with only required fields', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            i: [
                {
                    t: 'jetton',
                    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    d: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    am: '10000000'
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.items[0]).toEqual({
            type: 'jetton',
            master: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            destination: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
            amount: '10000000'
        });
    });

    it('expands nft items with all optional fields', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            i: [
                {
                    t: 'nft',
                    na: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    no: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    aa: '100000000',
                    rd: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    cp: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
                    fa: '1',
                    fp: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
                    qi: '99'
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.items[0]).toEqual({
            type: 'nft',
            nft_address: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            new_owner: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
            attach_amount: '100000000',
            response_destination: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            custom_payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
            forward_amount: '1',
            forward_payload: 'te6cckEBAQEADAAAFAAAAABIZWxsbyGVgYQo',
            query_id: '99'
        });
    });

    it('expands mixed ton + jetton items', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            n: '-239',
            vu: 1761071945,
            i: [
                {
                    t: 'ton',
                    a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    am: '100000000'
                },
                {
                    t: 'jetton',
                    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    d: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    am: '10000000',
                    rd: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    fa: '10000'
                }
            ]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload.items).toHaveLength(2);
        expect(payload.items[0].type).toBe('ton');
        expect(payload.items[1].type).toBe('jetton');
    });

    it('expands a signMessage request', () => {
        const wire: EmbeddedWireSignMessage = {
            m: 'sm',
            n: '-239',
            vu: 1761071945,
            ms: [{ a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', am: '0' }]
        };

        const result = expandEmbeddedWireRequest(wire);
        expect(result.method).toBe('signMessage');

        const payload = JSON.parse(result.params[0]);
        expect(payload.network).toBe('-239');
        expect(payload.messages).toHaveLength(1);
    });

    it('expands a signData text request', () => {
        const wire: EmbeddedWireSignData = {
            m: 'sd',
            n: '-239',
            f: '0:abc123',
            t: 'text',
            tx: 'Hello, world!'
        };

        const result = expandEmbeddedWireRequest(wire);
        expect(result.method).toBe('signData');

        const payload = JSON.parse(result.params[0]);
        expect(payload).toEqual({
            network: '-239',
            from: '0:abc123',
            type: 'text',
            text: 'Hello, world!'
        });
    });

    it('expands a signData binary request', () => {
        const wire: EmbeddedWireSignData = {
            m: 'sd',
            t: 'binary',
            b: 'AQIDBA=='
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);
        expect(payload).toEqual({ type: 'binary', bytes: 'AQIDBA==' });
    });

    it('expands a signData cell request', () => {
        const wire: EmbeddedWireSignData = {
            m: 'sd',
            t: 'cell',
            s: 'some_schema',
            c: 'te6cckEBAQEABgAACAAAAABT+rFy'
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);
        expect(payload).toEqual({
            type: 'cell',
            schema: 'some_schema',
            cell: 'te6cckEBAQEABgAACAAAAABT+rFy'
        });
    });

    it('omits undefined optional fields from the expanded payload', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            ms: [{ a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', am: '100' }]
        };

        const result = expandEmbeddedWireRequest(wire);
        const payload = JSON.parse(result.params[0]);

        expect(payload).not.toHaveProperty('network');
        expect(payload).not.toHaveProperty('from');
        expect(payload).not.toHaveProperty('items');
        expect(payload.messages[0]).not.toHaveProperty('payload');
        expect(payload.messages[0]).not.toHaveProperty('stateInit');
        expect(payload.messages[0]).not.toHaveProperty('extra_currency');
    });
});

describe('parseEmbeddedRequest', () => {
    it('decodes base64url and expands a sendTransaction', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            n: '-239',
            vu: 1761071945,
            ms: [{ a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', am: '1000000000' }]
        };

        const reqParam = encodeReqParam(wire);
        const result = parseEmbeddedRequest(reqParam);

        expect(result.method).toBe('sendTransaction');
        const payload = JSON.parse(result.params[0]);
        expect(payload.valid_until).toBe(1761071945);
        expect(payload.network).toBe('-239');
        expect(payload.messages[0].address).toBe(
            'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'
        );
    });

    it('decodes a signMessage with jetton items', () => {
        const wire: EmbeddedWireSignMessage = {
            m: 'sm',
            vu: 1761071945,
            i: [
                {
                    t: 'jetton',
                    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    d: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    am: '10000000',
                    rd: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    fa: '10000'
                }
            ]
        };

        const reqParam = encodeReqParam(wire);
        const result = parseEmbeddedRequest(reqParam);

        expect(result.method).toBe('signMessage');
        const payload = JSON.parse(result.params[0]);
        expect(payload.items[0].type).toBe('jetton');
        expect(payload.items[0].master).toBe('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');
        expect(payload.items[0].forward_amount).toBe('10000');
    });

    it('decodes a signData text request', () => {
        const wire: EmbeddedWireSignData = {
            m: 'sd',
            n: '-239',
            t: 'text',
            tx: 'Sign this message'
        };

        const reqParam = encodeReqParam(wire);
        const result = parseEmbeddedRequest(reqParam);

        expect(result.method).toBe('signData');
        const payload = JSON.parse(result.params[0]);
        expect(payload.type).toBe('text');
        expect(payload.text).toBe('Sign this message');
    });

    it('handles base64url characters correctly (no + / = in input)', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            f: '0:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            ms: [
                {
                    a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    am: '999999999'
                }
            ]
        };

        const reqParam = encodeReqParam(wire);
        expect(reqParam).not.toContain('+');
        expect(reqParam).not.toContain('/');
        expect(reqParam).not.toContain('=');

        const result = parseEmbeddedRequest(reqParam);
        expect(result.method).toBe('sendTransaction');
        const payload = JSON.parse(result.params[0]);
        expect(payload.from).toBe(
            '0:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        );
    });

    it('roundtrips through encode → parse for a complex request', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            n: '-239',
            f: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
            vu: 1761071945,
            i: [
                {
                    t: 'ton',
                    a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    am: '100000000'
                },
                {
                    t: 'jetton',
                    ma: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    d: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
                    am: '10000000',
                    rd: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    fa: '10000'
                },
                {
                    t: 'nft',
                    na: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
                    no: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c'
                }
            ]
        };

        const reqParam = encodeReqParam(wire);
        const result = parseEmbeddedRequest(reqParam);
        const payload = JSON.parse(result.params[0]);

        expect(result.method).toBe('sendTransaction');
        expect(payload.network).toBe('-239');
        expect(payload.from).toBe('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');
        expect(payload.valid_until).toBe(1761071945);
        expect(payload.items).toHaveLength(3);
        expect(payload.items[0].type).toBe('ton');
        expect(payload.items[1].type).toBe('jetton');
        expect(payload.items[2].type).toBe('nft');
        expect(payload.items[2].nft_address).toBe(
            'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'
        );
        expect(payload.items[2].new_owner).toBe('EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c');
    });

    it('returns ParsedEmbeddedRequest compatible with AppRequest shape', () => {
        const wire: EmbeddedWireSendTransaction = {
            m: 'st',
            vu: 1761071945,
            ms: [{ a: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs', am: '1' }]
        };

        const result: ParsedEmbeddedRequest = parseEmbeddedRequest(encodeReqParam(wire));

        expect(result).toHaveProperty('method');
        expect(result).toHaveProperty('params');
        expect(result.params).toHaveLength(1);
        expect(typeof result.params[0]).toBe('string');
        expect(() => JSON.parse(result.params[0])).not.toThrow();
    });
});

import { describe, it, expect } from 'vitest';

import { normalizeStructuredItem } from 'src/utils/normalize-structured-item';
import { JettonItem, NftItem, TonItem } from 'src/models/methods/send-transaction/structured-item';

const JETTON_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';
const RECIPIENT = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
const NFT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

const STD_BOC = 'te6ccgEBAQEABgAACAAAAABT+rFy';
const URLSAFE_BOC = 'te6ccgEBAQEABgAACAAAAABT-rFy'; // same payload, base64url

describe('utils/normalizeStructuredItem', () => {
    describe('TonItem', () => {
        it('renames extraCurrency → extra_currency', () => {
            const item: TonItem = {
                type: 'ton',
                address: RECIPIENT,
                amount: '1000',
                extraCurrency: { 239: '100' }
            };
            const result = normalizeStructuredItem(item);
            expect(result).toEqual({
                type: 'ton',
                address: RECIPIENT,
                amount: '1000',
                payload: undefined,
                stateInit: undefined,
                extra_currency: { 239: '100' }
            });
            expect('extraCurrency' in result).toBe(false);
        });

        it('normalises base64url payload / stateInit to standard base64', () => {
            const item: TonItem = {
                type: 'ton',
                address: RECIPIENT,
                amount: '1000',
                payload: URLSAFE_BOC,
                stateInit: URLSAFE_BOC
            };
            const result = normalizeStructuredItem(item);
            // base64url's `-` and `_` are rewritten to `+` and `/` respectively
            // and the result is right-padded with `=` to a multiple of 4
            expect(result.payload).toBe('te6ccgEBAQEABgAACAAAAABT+rFy');
            expect(result.stateInit).toBe('te6ccgEBAQEABgAACAAAAABT+rFy');
        });

        it('leaves an already-canonical base64 payload unchanged', () => {
            const item: TonItem = {
                type: 'ton',
                address: RECIPIENT,
                amount: '1000',
                payload: STD_BOC
            };
            const result = normalizeStructuredItem(item);
            expect(result.payload).toBe(STD_BOC);
        });

        it('keeps payload / stateInit as undefined when omitted', () => {
            const item: TonItem = { type: 'ton', address: RECIPIENT, amount: '1000' };
            const result = normalizeStructuredItem(item);
            expect(result.payload).toBeUndefined();
            expect(result.stateInit).toBeUndefined();
            expect(result.extra_currency).toBeUndefined();
        });

        it('round-trips zero amount and very large amount', () => {
            const zero = normalizeStructuredItem({ type: 'ton', address: RECIPIENT, amount: '0' });
            expect(zero.amount).toBe('0');
            const huge = '340282366920938463463374607431768211455';
            const big = normalizeStructuredItem({ type: 'ton', address: RECIPIENT, amount: huge });
            expect(big.amount).toBe(huge);
        });
    });

    describe('JettonItem', () => {
        it('normalises customPayload / forwardPayload', () => {
            const item: JettonItem = {
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000000',
                customPayload: URLSAFE_BOC,
                forwardPayload: URLSAFE_BOC,
                attachAmount: '50000000',
                forwardAmount: '1',
                queryId: '42',
                responseDestination: RECIPIENT
            };
            const result = normalizeStructuredItem(item);
            expect(result).toMatchObject({
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000000',
                customPayload: 'te6ccgEBAQEABgAACAAAAABT+rFy',
                forwardPayload: 'te6ccgEBAQEABgAACAAAAABT+rFy',
                attachAmount: '50000000',
                forwardAmount: '1',
                queryId: '42',
                responseDestination: RECIPIENT
            });
        });

        it('keeps optional payloads as undefined when omitted', () => {
            const item: JettonItem = {
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000'
            };
            const result = normalizeStructuredItem(item);
            expect(result.customPayload).toBeUndefined();
            expect(result.forwardPayload).toBeUndefined();
        });

        it('does NOT have a stateInit field on the output', () => {
            const item: JettonItem = {
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000'
            };
            const result = normalizeStructuredItem(item);
            expect('stateInit' in result).toBe(false);
        });
    });

    describe('NftItem', () => {
        it('normalises customPayload / forwardPayload', () => {
            const item: NftItem = {
                type: 'nft',
                nftAddress: NFT_ADDRESS,
                newOwner: RECIPIENT,
                customPayload: URLSAFE_BOC,
                forwardPayload: URLSAFE_BOC,
                attachAmount: '100000000',
                forwardAmount: '1',
                queryId: '99'
            };
            const result = normalizeStructuredItem(item);
            expect(result).toMatchObject({
                type: 'nft',
                nftAddress: NFT_ADDRESS,
                newOwner: RECIPIENT,
                customPayload: 'te6ccgEBAQEABgAACAAAAABT+rFy',
                forwardPayload: 'te6ccgEBAQEABgAACAAAAABT+rFy',
                attachAmount: '100000000',
                forwardAmount: '1',
                queryId: '99'
            });
        });

        it('keeps optional payloads as undefined when omitted', () => {
            const item: NftItem = {
                type: 'nft',
                nftAddress: NFT_ADDRESS,
                newOwner: RECIPIENT
            };
            const result = normalizeStructuredItem(item);
            expect(result.customPayload).toBeUndefined();
            expect(result.forwardPayload).toBeUndefined();
        });
    });

    describe('JSON.stringify drops undefined fields', () => {
        // Wire encoding is JSON.stringify(payload). undefined-valued keys are dropped,
        // so the wallet receives a compact body — verify the wire shape.
        it('omits unset optional fields from the JSON wire body for jetton', () => {
            const item: JettonItem = {
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000'
            };
            const result = normalizeStructuredItem(item);
            const wire = JSON.parse(JSON.stringify(result));
            expect(wire).toEqual({
                type: 'jetton',
                master: JETTON_MASTER,
                destination: RECIPIENT,
                amount: '1000'
            });
            expect('customPayload' in wire).toBe(false);
            expect('forwardPayload' in wire).toBe(false);
        });
    });
});

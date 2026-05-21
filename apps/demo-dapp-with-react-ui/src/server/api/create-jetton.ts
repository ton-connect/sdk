import { JettonMinter, storeJettonMintMessage } from '@ton-community/assets-sdk';
import { internalOnchainContentToCell } from '@ton-community/assets-sdk/dist/utils';
import { beginCell, storeStateInit, toNano } from '@ton/core';
import { Address } from '@ton/ton';
import { CHAIN } from '@tonconnect/sdk';
import { HttpResponseResolver } from 'msw';
import { CreateJettonRequest } from '../dto/create-jetton-request-dto';
import { badRequest, ok } from '../utils/http-utils';

const VALID_UNTIL = 1000 * 60 * 5; // 5 minutes

/**
 * Builds a jetton deploy + mint transaction for the connected wallet.
 *
 * POST /api/create_jetton
 * Body: { address, network?, ...jetton metadata }
 */
export const createJetton: HttpResponseResolver = async ({ request }) => {
    try {
        const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;

        if (!raw?.address || typeof raw.address !== 'string') {
            return badRequest({ error: 'address is required' });
        }

        const network =
            typeof raw.network === 'string' ? raw.network : CHAIN.MAINNET;

        const { address: _address, network: _network, ...jettonFields } = raw;
        const body = CreateJettonRequest.parse(jettonFields);

        const validUntil = Math.round((Date.now() + VALID_UNTIL) / 1000);
        const amount = toNano('0.06').toString();
        const walletForwardValue = toNano('0.05');

        const senderAddress = Address.parse(raw.address);
        const ownerAddress = Address.parse(raw.address);
        const receiverAddress = Address.parse(raw.address);

        const jettonMaster = JettonMinter.createFromConfig({
            admin: ownerAddress,
            content: internalOnchainContentToCell({
                name: body.name,
                description: body.description,
                image_data: Buffer.from(body.image_data, 'ascii').toString('base64'),
                symbol: body.symbol,
                decimals: body.decimals
            })
        });
        if (!jettonMaster.init) {
            return badRequest({ error: 'Invalid jetton master' });
        }

        const jettonMasterAddress = jettonMaster.address.toString({
            urlSafe: true,
            bounceable: true,
            testOnly: network === CHAIN.TESTNET
        });

        const stateInitBase64 = beginCell()
            .store(storeStateInit(jettonMaster.init))
            .endCell()
            .toBoc()
            .toString('base64');

        const payloadBase64 = beginCell()
            .store(
                storeJettonMintMessage({
                    queryId: 0n,
                    amount: BigInt(body.amount),
                    from: jettonMaster.address,
                    to: receiverAddress,
                    responseAddress: senderAddress,
                    forwardPayload: null,
                    forwardTonAmount: 1n,
                    walletForwardValue: walletForwardValue
                })
            )
            .endCell()
            .toBoc()
            .toString('base64');

        return ok({
            validUntil: validUntil,
            from: senderAddress.toRawString(),
            messages: [
                {
                    address: jettonMasterAddress,
                    amount: amount,
                    stateInit: stateInitBase64,
                    payload: payloadBase64
                }
            ]
        });
    } catch (e) {
        if (e instanceof Error) {
            return badRequest({ error: 'Invalid request', trace: e.message });
        }
        return badRequest({ error: 'Invalid request', trace: e });
    }
};

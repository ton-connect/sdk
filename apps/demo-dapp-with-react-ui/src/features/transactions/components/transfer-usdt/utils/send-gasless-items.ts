import {
    Address,
    beginCell,
    Cell,
    external,
    internal,
    loadMessageRelaxed,
    storeMessage,
    storeMessageRelaxed,
    toNano
} from '@ton/core';

import { TonApiClient } from '@ton-api/client';
import { JettonItem, TonConnectUI } from '@tonconnect/ui-react';
import { retry } from '../../../../../core/utils/retry';

import { resolveGaslessWallet } from './gasless-wallet';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

const OP_CODES = {
    TK_RELAYER_FEE: 0x878da6e3,
    JETTON_TRANSFER: 0xf8a7ea5
};
const BASE_JETTON_SEND_AMOUNT = toNano(0.05);
const usdtMaster = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');

export type GaslessItemsResult = {
    mode: 'items';
    internalBoc: string;
    relayResponse: unknown;
    destination: string;
    amount: string;
    submittedAt: string;
};

export async function sendGaslessItems(
    tonConnectUi: TonConnectUI,
    jettonAmount: number | bigint,
    destination: Address,
    senderAddress?: string
): Promise<GaslessItemsResult> {
    const { walletAddress, publicKey } = await resolveGaslessWallet(tonConnectUi, senderAddress);

    const jettonWalletAddressResult = await ta.blockchain.execGetMethodForBlockchainAccount(
        usdtMaster,
        'get_wallet_address',
        { args: [walletAddress.toString()] }
    );
    const jettonWallet = Address.parse(jettonWalletAddressResult.decoded.jetton_wallet_address);

    const relayerAddress = await printConfigAndReturnRelayAddress();
    const tetherTransferPayload = beginCell()
        .storeUint(OP_CODES.JETTON_TRANSFER, 32)
        .storeUint(0, 64)
        .storeCoins(jettonAmount)
        .storeAddress(destination)
        .storeAddress(relayerAddress)
        .storeBit(false)
        .storeCoins(1n)
        .storeMaybeRef(undefined)
        .endCell();

    const messageToEstimate = beginCell()
        .storeWritable(
            storeMessageRelaxed(
                internal({
                    to: jettonWallet,
                    bounce: true,
                    value: BASE_JETTON_SEND_AMOUNT,
                    body: tetherTransferPayload
                })
            )
        )
        .endCell();

    const params = await ta.gasless.gaslessEstimate(usdtMaster, {
        walletAddress,
        walletPublicKey: publicKey,
        messages: [{ boc: messageToEstimate }]
    });

    function payloadToStructuredItem(p: Cell): JettonItem {
        const c = p.beginParse();
        c.skip(32);
        c.loadUintBig(64);
        const amount = c.loadCoins();
        const dest = c.loadAddress();
        const responseDestination = c.loadMaybeAddress();
        c.skip(1);
        const forwardAmount = c.loadCoins();
        return {
            type: 'jetton',
            master: usdtMaster.toString(),
            amount: amount.toString(),
            destination: dest.toString(),
            responseDestination: responseDestination?.toString(),
            forwardAmount: forwardAmount.toString()
        };
    }

    const { internalBoc } = await tonConnectUi.signMessage({
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        items: params.messages.map(message => payloadToStructuredItem(message.payload!))
    });

    const {
        info: { dest },
        body,
        init
    } = loadMessageRelaxed(Cell.fromBase64(internalBoc).beginParse());

    const extMessage = beginCell()
        .storeWritable(
            storeMessage(
                external({
                    to: dest as Address,
                    init,
                    body
                })
            )
        )
        .endCell();

    const relayPublicKey = tonConnectUi.wallet?.account?.publicKey ?? publicKey;
    const relayResponse = await retry(
        () =>
            ta.gasless.gaslessSend({
                walletPublicKey: relayPublicKey,
                boc: extMessage
            }),
        { delay: 2000, retries: 5 }
    );

    return {
        mode: 'items',
        internalBoc,
        relayResponse: relayResponse ?? null,
        destination: destination.toString(),
        amount: jettonAmount.toString(),
        submittedAt: new Date().toISOString()
    };
}

async function printConfigAndReturnRelayAddress(): Promise<Address> {
    const cfg = await ta.gasless.gaslessConfig();
    return cfg.relayAddress;
}

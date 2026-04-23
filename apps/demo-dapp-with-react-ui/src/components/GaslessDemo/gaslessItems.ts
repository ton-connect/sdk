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
import { retry } from '../../utils/retry';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

const OP_CODES = {
    TK_RELAYER_FEE: 0x878da6e3,
    JETTON_TRANSFER: 0xf8a7ea5
};
const BASE_JETTON_SEND_AMOUNT = toNano(0.05);
const usdtMaster = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'); // USDt jetton master.

export async function sendItems(
    tonConnectUi: TonConnectUI,
    jettonAmount: number | bigint,
    destination: Address
) {
    if (!tonConnectUi.wallet?.account?.address || !tonConnectUi.wallet?.account?.publicKey) {
        console.error('No connected wallet found.');
        throw new Error('No wallet found.');
    }
    const walletAddress = Address.parse(tonConnectUi.wallet.account.address);
    const publicKey = tonConnectUi.wallet.account.publicKey;

    console.debug({ walletAddress, publicKey });
    const jettonWalletAddressResult = await ta.blockchain.execGetMethodForBlockchainAccount(
        usdtMaster,
        'get_wallet_address',
        {
            args: [walletAddress.toString()]
        }
    );
    console.debug('jettonWalletAddressResult', jettonWalletAddressResult);
    const jettonWallet = Address.parse(jettonWalletAddressResult.decoded.jetton_wallet_address);

    console.debug('re');
    const relayerAddress = await printConfigAndReturnRelayAddress();
    console.debug('relayerAddress', relayerAddress);
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

    console.debug('Estimated transfer:', params);

    function payloadToStructuredItem(p: Cell): JettonItem {
        const c = p.beginParse();
        c.skip(32);
        c.loadUintBig(64); // query id
        const amount = c.loadCoins();
        const destination = c.loadAddress();
        const responseDestination = c.loadMaybeAddress();
        c.skip(1);
        const forwardAmount = c.loadCoins();
        return {
            type: 'jetton',
            master: usdtMaster.toString(),
            amount: amount.toString(),
            destination: destination.toString(),
            responseDestination: responseDestination?.toString(),
            forwardAmount: forwardAmount.toString()
        };
    }

    const { internalBoc } = await tonConnectUi.signMessage({
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        items: params.messages.map(message => payloadToStructuredItem(message.payload!))
    });
    console.debug('internalBoc', internalBoc);

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

    return await retry(
        () =>
            ta.gasless.gaslessSend({
                walletPublicKey: publicKey,
                boc: extMessage
            }),
        { delay: 2000, retries: 5 }
    );
}

async function printConfigAndReturnRelayAddress(): Promise<Address> {
    const cfg = await ta.gasless.gaslessConfig();

    console.debug('Available jettons for gasless transfer');
    console.debug(cfg.gasJettons.map(gasJetton => gasJetton.masterId));

    console.debug(`Relay address to send fees to: ${cfg.relayAddress}`);
    return cfg.relayAddress;
}

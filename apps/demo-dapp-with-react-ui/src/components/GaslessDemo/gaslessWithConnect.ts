import { Address, beginCell, Cell, internal, storeMessageRelaxed, toNano } from '@ton/core';

import { TonApiClient } from '@ton-api/client';
import { TonConnectUI } from '@tonconnect/ui-react';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

const OP_CODES = {
    TK_RELAYER_FEE: 0x878da6e3,
    JETTON_TRANSFER: 0xf8a7ea5
};
const BASE_JETTON_SEND_AMOUNT = toNano(0.05);
const usdtMaster = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'); // USDt jetton master.

export async function sendWithConnectedWallet(
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

    console.log({ walletAddress, publicKey });
    const jettonWalletAddressResult = await ta.blockchain.execGetMethodForBlockchainAccount(
        usdtMaster,
        'get_wallet_address',
        {
            args: [walletAddress.toString()]
        }
    );
    console.log('jettonWalletAddressResult', jettonWalletAddressResult);
    const jettonWallet = Address.parse(jettonWalletAddressResult.decoded.jetton_wallet_address);

    console.log('re');
    const relayerAddress = await printConfigAndReturnRelayAddress();
    console.log('relayerAddress', relayerAddress);
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

    console.log('Estimated transfer:', params);

    const { internalBoc } = await tonConnectUi.signMessage({
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        messages: params.messages.map(message => ({
            address: message.address.toString(),
            payload: message.payload?.toBoc()?.toString('base64'),
            amount: message.amount,
            stateInit: message.payload?.toBoc()?.toString('base64')
        }))
    });
    console.log('internalBoc', internalBoc);

    return await ta.gasless.gaslessSend({
        walletPublicKey: publicKey,
        boc: Cell.fromBase64(internalBoc)
    });
}

async function printConfigAndReturnRelayAddress(): Promise<Address> {
    const cfg = await ta.gasless.gaslessConfig();

    console.log('Available jettons for gasless transfer');
    console.log(cfg.gasJettons.map(gasJetton => gasJetton.masterId));

    console.log(`Relay address to send fees to: ${cfg.relayAddress}`);
    return cfg.relayAddress;
}

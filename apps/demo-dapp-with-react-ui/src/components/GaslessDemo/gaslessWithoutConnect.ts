import { Address, Cell, toNano } from '@ton/core';

import { TonApiClient } from '@ton-api/client';
import { TonConnectUI } from '@tonconnect/ui-react';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

const BASE_JETTON_SEND_AMOUNT = toNano(0.05);
const usdtMaster = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'); // USDt jetton master.

export async function sendWithoutConnectedWallet(
    tonConnectUi: TonConnectUI,
    jettonAmount: number | bigint,
    destination: Address
) {
    console.log('sendWithoutConnectedWallet');
    const responseDestination = await printConfigAndReturnRelayAddress();
    const result = await fetch('https://battery.tonkeeper.com/gasless/estimate/jetton-transfer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            jetton_master: usdtMaster.toString(),
            destination: destination.toString(),
            responseDestination: responseDestination.toString(),
            attached_ton: BASE_JETTON_SEND_AMOUNT.toString(),
            forward_ton_amount: '1'
        })
    });
    console.log('result', result);
    if (!result.ok) {
        throw new Error('Invalid request tonapi');
    }
    const response = await result.json();
    const gaslessProviderAmount = response?.amount;
    const gaslessProviderDestination = response?.destination;

    console.log('Response', { gaslessProviderAmount, gaslessProviderDestination }, response);

    const { internalBoc } = await tonConnectUi.signMessageDraft({
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        items: [
            {
                type: 'jetton',
                jettonMasterAddress: usdtMaster.toString(),
                jettonAmount: jettonAmount.toString(),
                destination: destination.toString(),
                responseDestination: responseDestination.toString(),
                attachedTon: BASE_JETTON_SEND_AMOUNT.toString(),
                forwardTonAmount: '1'
            },
            {
                type: 'jetton',
                jettonMasterAddress: usdtMaster.toString(),
                jettonAmount: String(gaslessProviderAmount),
                destination: gaslessProviderDestination.toString(),
                responseDestination: responseDestination.toString()
            }
        ]
    });

    console.log('internalBoc', internalBoc);

    const walletPublicKey = tonConnectUi.wallet?.account?.publicKey!;

    return await ta.gasless.gaslessSend({
        walletPublicKey,
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

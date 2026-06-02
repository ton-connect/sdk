import type { SendTransactionRequest } from '@tonconnect/ui-react';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { storeJettonTransferMessage } from '@ton-community/assets-sdk';

import { ATTACHED_AMOUNT_TON, FORWARD_AMOUNT_TON, VALID_UNTIL_SECONDS } from './constants';
import { waitForWalletConnection } from './gasless-wallet';
import { resolveUsdtJettonWallet } from './resolve-usdt-jetton-wallet';

const chainFromConnectedWallet = (tonConnectUi: TonConnectUI): CHAIN | undefined => {
    const chain = tonConnectUi.wallet?.account.chain;
    if (chain === CHAIN.MAINNET || chain === CHAIN.TESTNET) {
        return chain;
    }
    return undefined;
};

export interface StandardUsdtTransferParams {
    tonConnectUi: TonConnectUI;
    senderAddress: string;
    destination: string;
    jettonWallet: string;
    amountUsdt: bigint;
    withConnect: boolean;
    chain: CHAIN | undefined;
}

export async function buildStandardUsdtTransaction({
    tonConnectUi,
    senderAddress,
    destination,
    jettonWallet,
    amountUsdt,
    withConnect,
    chain
}: StandardUsdtTransferParams): Promise<SendTransactionRequest> {
    let resolvedSender = senderAddress || tonConnectUi.wallet?.account?.address;
    let resolvedJettonWallet = jettonWallet;

    if (withConnect && !resolvedSender) {
        await waitForWalletConnection(tonConnectUi);
        resolvedSender = tonConnectUi.wallet?.account?.address;
    }

    const resolvedChain = chain ?? chainFromConnectedWallet(tonConnectUi);
    if (!resolvedJettonWallet && resolvedSender && resolvedChain) {
        resolvedJettonWallet = await resolveUsdtJettonWallet(resolvedSender, resolvedChain);
    }

    if (!resolvedSender || !resolvedJettonWallet) {
        throw new Error('Connect wallet to resolve your USDT jetton wallet before sending.');
    }

    const body = beginCell()
        .store(
            storeJettonTransferMessage({
                queryId: 0n,
                amount: amountUsdt,
                destination: Address.parse(destination),
                responseDestination: Address.parse(resolvedSender),
                customPayload: null,
                forwardAmount: toNano(FORWARD_AMOUNT_TON),
                forwardPayload: beginCell().storeUint(0, 32).storeStringTail('hello!').endCell()
            })
        )
        .endCell()
        .toBoc()
        .toString('base64');

    return {
        validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
        messages: [
            {
                address: resolvedJettonWallet,
                amount: toNano(ATTACHED_AMOUNT_TON).toString(),
                payload: body
            }
        ]
    };
}

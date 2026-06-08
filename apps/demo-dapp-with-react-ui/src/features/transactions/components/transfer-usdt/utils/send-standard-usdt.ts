import type { SendTransactionRequest } from '@tonconnect/ui-react';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { storeJettonTransferMessage } from '@ton-community/assets-sdk';

import {
    ATTACHED_AMOUNT_TON,
    FORWARD_AMOUNT_TON,
    USDT_MASTER_BY_CHAIN,
    VALID_UNTIL_SECONDS
} from './constants';
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
    requestMode: 'messages' | 'items';
}

export async function buildStandardUsdtTransaction({
    tonConnectUi,
    senderAddress,
    destination,
    jettonWallet,
    amountUsdt,
    withConnect,
    chain,
    requestMode
}: StandardUsdtTransferParams): Promise<SendTransactionRequest> {
    let resolvedSender = senderAddress || tonConnectUi.wallet?.account?.address;

    if (withConnect && !resolvedSender) {
        await waitForWalletConnection(tonConnectUi);
        resolvedSender = tonConnectUi.wallet?.account?.address;
    }

    const resolvedChain = chain ?? chainFromConnectedWallet(tonConnectUi);
    if (!resolvedSender || !resolvedChain) {
        throw new Error('Connect wallet before sending USDT.');
    }

    const forwardPayload = beginCell().storeUint(0, 32).storeStringTail('hello!').endCell();

    if (requestMode === 'items') {
        return {
            validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
            items: [
                {
                    type: 'jetton',
                    master: USDT_MASTER_BY_CHAIN[resolvedChain].toString(),
                    amount: amountUsdt.toString(),
                    destination: Address.parse(destination).toString({
                        urlSafe: true,
                        bounceable: false
                    }),
                    responseDestination: Address.parse(resolvedSender).toString({
                        urlSafe: true,
                        bounceable: false
                    }),
                    forwardAmount: toNano(FORWARD_AMOUNT_TON).toString(),
                    forwardPayload: forwardPayload.toBoc().toString('base64'),
                    attachAmount: toNano(ATTACHED_AMOUNT_TON).toString()
                }
            ]
        };
    }

    let resolvedJettonWallet = jettonWallet;
    if (!resolvedJettonWallet) {
        resolvedJettonWallet = await resolveUsdtJettonWallet(resolvedSender, resolvedChain);
    }

    if (!resolvedJettonWallet) {
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
                forwardPayload
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

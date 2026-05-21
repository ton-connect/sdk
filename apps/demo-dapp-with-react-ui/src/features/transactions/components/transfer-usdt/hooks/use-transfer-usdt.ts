import { useCallback, useState } from 'react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { storeJettonTransferMessage } from '@ton-community/assets-sdk';

import { fail, ok, type OperationResult } from '../../../../../core/components/shared/result-block';
import { parseUnits } from '../../../../../core/utils/units';

import {
    ATTACHED_AMOUNT_TON,
    FORWARD_AMOUNT_TON,
    USDT_DECIMALS,
    VALID_UNTIL_SECONDS
} from '../utils/constants';
import { sendGaslessItems } from '../utils/send-gasless-items';
import { sendGaslessMessages } from '../utils/send-gasless-messages';
import type { GaslessMode } from './use-transfer-form';

interface SendArgs {
    senderAddress: string;
    destination: string;
    jettonWallet: string;
    amount: string;
    gasless: boolean;
    gaslessMode: GaslessMode;
    withConnect: boolean;
}

async function dispatchTransfer(
    tonConnectUi: ReturnType<typeof useTonConnectUI>[0],
    tx: SendTransactionRequest,
    withConnect: boolean
) {
    if (withConnect) {
        const embedded = await tonConnectUi.sendTransaction(tx, {
            enableEmbeddedRequest: true
        });
        if (!embedded.hasResponse) {
            return { ok: false as const, dispatched: embedded.connectResult.dispatched };
        }
        return { ok: true as const, response: embedded.response };
    }

    const response = await tonConnectUi.sendTransaction(tx);
    return { ok: true as const, response };
}

export const useTransferUsdt = () => {
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const send = useCallback(
        async ({
            senderAddress,
            destination,
            jettonWallet,
            amount,
            gasless,
            gaslessMode,
            withConnect
        }: SendArgs) => {
            const amountUsdt = parseUnits(amount, USDT_DECIMALS);
            if (!(amountUsdt > 0)) return;

            setResult(null);
            setSending(true);
            try {
                if (gasless) {
                    const dest = Address.parse(destination);
                    const data =
                        gaslessMode === 'items'
                            ? await sendGaslessItems(
                                  tonConnectUi,
                                  amountUsdt,
                                  dest,
                                  senderAddress || undefined
                              )
                            : await sendGaslessMessages(
                                  tonConnectUi,
                                  amountUsdt,
                                  dest,
                                  senderAddress || undefined
                              );
                    setResult(ok(data));
                    return;
                }

                if (!jettonWallet) {
                    setResult(
                        fail(
                            new Error(
                                'Connect wallet to resolve your USDT jetton wallet before sending.'
                            )
                        )
                    );
                    return;
                }

                const body = beginCell()
                    .store(
                        storeJettonTransferMessage({
                            queryId: 0n,
                            amount: amountUsdt,
                            destination: Address.parse(destination),
                            responseDestination: Address.parse(senderAddress),
                            customPayload: null,
                            forwardAmount: toNano(FORWARD_AMOUNT_TON),
                            forwardPayload: beginCell()
                                .storeUint(0, 32)
                                .storeStringTail('hello!')
                                .endCell()
                        })
                    )
                    .endCell()
                    .toBoc()
                    .toString('base64');

                const tx: SendTransactionRequest = {
                    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
                    messages: [
                        {
                            address: jettonWallet,
                            amount: toNano(ATTACHED_AMOUNT_TON).toString(),
                            payload: body
                        }
                    ]
                };

                const outcome = await dispatchTransfer(tonConnectUi, tx, withConnect);
                if (!outcome.ok) {
                    setResult(
                        fail({
                            error:
                                outcome.dispatched === true
                                    ? 'Connect succeeded but no transaction response. Check your wallet before retrying.'
                                    : 'Wallet connected but the transfer was not delivered. Safe to retry.'
                        })
                    );
                    return;
                }
                setResult(ok(outcome.response));
            } catch (error) {
                console.error('transferUsdt failed', error);
                setResult(fail(error));
            } finally {
                setSending(false);
            }
        },
        [tonConnectUi]
    );

    const clearResult = useCallback(() => setResult(null), []);

    return { send, sending, result, clearResult };
};

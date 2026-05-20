import { useCallback, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address, beginCell, toNano } from '@ton/core';
import { storeJettonTransferMessage } from '@ton-community/assets-sdk';

import { fail, ok, type OperationResult } from '../../../../../core/components/ui/result-block';
import { parseUnits } from '../../../../../core/utils/units';

import {
    ATTACHED_AMOUNT_TON,
    FORWARD_AMOUNT_TON,
    USDT_DECIMALS,
    VALID_UNTIL_SECONDS
} from '../lib/constants';

interface SendArgs {
    senderAddress: string;
    destination: string;
    jettonWallet: string;
    amount: string;
}

/**
 * Builds and dispatches a jetton-transfer message via TonConnect; captures the
 * BOC response (or error) into `result` for the page to render. Pure
 * orchestration — caller owns the form state, validation, and loading UX.
 */
export const useTransferUsdt = () => {
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const send = useCallback(
        async ({ senderAddress, destination, jettonWallet, amount }: SendArgs) => {
            const amountUsdt = parseUnits(amount, USDT_DECIMALS);
            if (!(amountUsdt > 0)) return;

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

            setResult(null);
            setSending(true);
            try {
                const response = await tonConnectUi.sendTransaction({
                    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
                    messages: [
                        {
                            address: jettonWallet,
                            amount: toNano(ATTACHED_AMOUNT_TON).toString(),
                            payload: body
                        }
                    ]
                });
                setResult(ok(response));
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

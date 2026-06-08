import { useCallback, useState } from 'react';
import type { CHAIN } from '@tonconnect/ui-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

import { fail, ok, type OperationResult } from '../../../../../core/components/shared/result-block';
import { parseUnits } from '../../../../../core/utils/units';

import { USDT_DECIMALS } from '../utils/constants';
import { dispatchTransfer, embeddedTransferFailure } from '../utils/dispatch-transfer';
import { sendGaslessItems } from '../utils/send-gasless-items';
import { sendGaslessMessages } from '../utils/send-gasless-messages';
import { buildStandardUsdtTransaction } from '../utils/send-standard-usdt';
import type { GaslessMode } from './use-transfer-form';

interface SendArgs {
    senderAddress: string;
    destination: string;
    jettonWallet: string;
    amount: string;
    gasless: boolean;
    gaslessMode: GaslessMode;
    withConnect: boolean;
    chain: CHAIN | undefined;
}

export const useTransferUsdt = () => {
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const send = useCallback(
        async (args: SendArgs) => {
            const amountUsdt = parseUnits(args.amount, USDT_DECIMALS);
            if (!(amountUsdt > 0)) return;

            setResult(null);
            setSending(true);
            try {
                if (args.gasless) {
                    const dest = Address.parse(args.destination);
                    const data =
                        args.gaslessMode === 'items'
                            ? await sendGaslessItems(
                                  tonConnectUi,
                                  amountUsdt,
                                  dest,
                                  args.senderAddress || undefined,
                                  args.withConnect
                              )
                            : await sendGaslessMessages(
                                  tonConnectUi,
                                  amountUsdt,
                                  dest,
                                  args.senderAddress || undefined,
                                  args.withConnect
                              );
                    setResult(ok(data));
                    return;
                }

                const tx = await buildStandardUsdtTransaction({
                    tonConnectUi,
                    senderAddress: args.senderAddress,
                    destination: args.destination,
                    jettonWallet: args.jettonWallet,
                    amountUsdt,
                    withConnect: args.withConnect,
                    chain: args.chain,
                    requestMode: args.gaslessMode
                });

                const outcome = await dispatchTransfer(tonConnectUi, tx, args.withConnect);
                if (!outcome.ok) {
                    setResult(fail(embeddedTransferFailure(outcome.dispatched)));
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

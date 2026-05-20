import { useCallback, useState } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

import { fail, ok, type OperationResult } from '../../../../../core/components/ui/result-block';
import { parseUnits } from '../../../../../core/utils/units';

import { USDT_DECIMALS } from '../../transfer-usdt/lib/constants';

import { sendItems } from '../lib/send-items';
import { sendMessages } from '../lib/send-messages';

export type GaslessMode = 'messages' | 'items';

interface SendArgs {
    mode: GaslessMode;
    destination: string;
    amount: string;
}

/**
 * Builds and dispatches a gasless USDT transfer via TonConnect. The two
 * `sendItems` / `sendMessages` flows differ only in how the relay invoice
 * is described to the wallet — they target the same gasless config and
 * produce the same on-chain effect. Captures BOC response (or error) into
 * `result` for the page to render.
 */
export const useGasless = () => {
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const send = useCallback(
        async ({ mode, destination, amount }: SendArgs) => {
            const amountNano = parseUnits(amount, USDT_DECIMALS);
            if (!(amountNano > 0)) return;

            setResult(null);
            setSending(true);
            try {
                const dispatch = mode === 'items' ? sendItems : sendMessages;
                const response = await dispatch(
                    tonConnectUi,
                    amountNano,
                    Address.parse(destination)
                );
                setResult(ok(response));
            } catch (error) {
                console.error(`gasless ${mode} failed`, error);
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

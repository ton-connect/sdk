import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import {
    fail,
    ok,
    type OperationResult
} from '../../../../../core/components/shared/result-block/index';
import type { CreateJettonRequestDto } from '../../../../../server/dto/create-jetton-request-dto';

import { fetchCreateJettonTransaction } from '../utils/create-jetton-api';

/**
 * Fetches the deploy+mint transaction from the demo backend, then dispatches it
 * via TonConnect — same orchestration shape as {@link useMerkleDemo}.
 */
export function useCreateJetton() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const canMint = !!wallet && !sending;

    const mint = useCallback(
        async (jetton: CreateJettonRequestDto) => {
            if (!wallet?.account || sending) {
                return;
            }

            setResult(null);
            setSending(true);

            try {
                const { transaction, error } = await fetchCreateJettonTransaction(
                    wallet.account,
                    jetton
                );
                if (error || !transaction) {
                    setResult(
                        fail({ error: error ?? 'Failed to build create jetton transaction' })
                    );
                    return;
                }

                const response = await tonConnectUi.sendTransaction(transaction);
                setResult(ok({ jetton: transaction, transaction: response }));
            } catch (error) {
                console.error('createJetton failed', error);
                setResult(fail(error));
            } finally {
                setSending(false);
            }
        },
        [tonConnectUi, wallet, sending]
    );

    const clearResult = useCallback(() => setResult(null), []);

    return {
        wallet,
        mint,
        sending,
        result,
        clearResult,
        canMint
    };
}

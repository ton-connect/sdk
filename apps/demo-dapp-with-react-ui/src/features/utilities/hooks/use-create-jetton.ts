import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import { fail, ok, type OperationResult } from '../../../core/components/ui/result-block/index';
import type { CreateJettonRequestDto } from '../../../server/dto/create-jetton-request-dto';

import { fetchCreateJettonTransaction } from '../lib/create-jetton-api';
import { hasDemoSession } from '../lib/demo-session';

/**
 * Fetches the deploy+mint transaction from the demo backend, then dispatches it
 * via TonConnect — same orchestration shape as {@link useTransferUsdt}. The
 * jetton metadata is supplied by the caller (see {@link useCreateJettonForm}),
 * so the page can edit any field before minting.
 */
export function useCreateJetton() {
    const wallet = useTonWallet();
    const [tonConnectUi] = useTonConnectUI();
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const hasSession = wallet ? hasDemoSession(wallet.account) : false;
    const needsTonProof = !!wallet && !hasSession;
    const canMint = !!wallet && hasSession && !sending;

    const mint = useCallback(
        async (jetton: CreateJettonRequestDto) => {
            if (!wallet || !hasSession) {
                return;
            }

            setResult(null);
            setSending(true);

            try {
                const { transaction, error } = await fetchCreateJettonTransaction(jetton);
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
        [tonConnectUi, wallet, hasSession]
    );

    const clearResult = useCallback(() => setResult(null), []);

    return {
        wallet,
        mint,
        sending,
        result,
        clearResult,
        canMint,
        needsTonProof
    };
}

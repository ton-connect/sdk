import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import {
    fail,
    ok,
    type OperationResult
} from '../../../../../core/components/shared/result-block/index';

import { buildMerkleUpdateTransaction } from '../utils/build-merkle-update-tx';
import { fetchMerkleProofTransaction, hasMerkleProofSession } from '../utils/merkle-api';

export type MerkleMode = 'proof' | 'update';

export function useMerkleDemo() {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [mode, setMode] = useState<MerkleMode>('proof');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const hasSession = wallet ? hasMerkleProofSession(wallet.account) : false;
    const needsTonProof = mode === 'proof' && wallet !== null && !hasSession;
    const canSend = !!wallet && !sending && (mode === 'update' || hasSession);

    const send = useCallback(async () => {
        if (!wallet || !canSend) {
            return;
        }

        setSending(true);
        setResult(null);

        try {
            if (mode === 'proof') {
                const { transaction, error } = await fetchMerkleProofTransaction();
                if (error || !transaction) {
                    setResult(fail({ error: error ?? 'Failed to build merkle proof transaction' }));
                    return;
                }
                const response = await tonConnectUI.sendTransaction(transaction);
                setResult(ok(response));
            } else {
                const response = await tonConnectUI.sendTransaction(buildMerkleUpdateTransaction());
                setResult(ok(response));
            }
        } catch (error) {
            console.error(`merkle ${mode} failed`, error);
            setResult(fail(error));
        } finally {
            setSending(false);
        }
    }, [wallet, canSend, mode, tonConnectUI]);

    const clearResult = useCallback(() => setResult(null), []);

    return {
        wallet,
        mode,
        setMode,
        sending,
        result,
        send,
        clearResult,
        canSend,
        needsTonProof,
        hasSession
    };
}

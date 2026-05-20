import { useCallback, useState } from 'react';

import {
    fail,
    ok,
    type OperationResult
} from '../../../../../core/components/shared/result-block/index';

import { DEFAULT_EXTERNAL_MESSAGE_BOC } from '../utils/default-external-message-boc';
import {
    findTransactionByExternalMessage,
    type FindTxNetwork
} from '../utils/find-transaction-api';

export type { FindTxNetwork };

export function useFindTransaction() {
    const [boc, setBoc] = useState(DEFAULT_EXTERNAL_MESSAGE_BOC);
    const [network, setNetwork] = useState<FindTxNetwork>('mainnet');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const canSearch = boc.trim().length > 0 && !loading;

    const findTransaction = useCallback(async () => {
        const trimmedBoc = boc.trim();
        if (!trimmedBoc) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const { transaction, error } = await findTransactionByExternalMessage(
                trimmedBoc,
                network
            );

            if (error || !transaction) {
                setResult(fail({ error: error ?? 'Transaction not found' }));
            } else {
                setResult(ok(transaction));
            }
        } catch (error) {
            setResult(fail(error));
        } finally {
            setLoading(false);
        }
    }, [boc, network]);

    const clearResult = useCallback(() => setResult(null), []);

    return {
        boc,
        setBoc,
        network,
        setNetwork,
        loading,
        result,
        findTransaction,
        clearResult,
        canSearch
    };
}

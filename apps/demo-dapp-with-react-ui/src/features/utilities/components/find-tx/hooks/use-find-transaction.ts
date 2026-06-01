import { useCallback, useMemo, useState } from 'react';

import {
    fail,
    ok,
    type OperationResult
} from '../../../../../core/components/shared/result-block/index';
import { validateExternalMessageBoc } from '../../../../../core/utils/validation';

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

    const bocError = useMemo(() => validateExternalMessageBoc(boc), [boc]);

    const findTransaction = useCallback(async () => {
        const validationError = validateExternalMessageBoc(boc);
        if (validationError) {
            setResult(null);
            return;
        }

        const trimmedBoc = boc.trim();
        setLoading(true);
        setResult(null);

        try {
            const { transaction, error } = await findTransactionByExternalMessage(
                trimmedBoc,
                network
            );

            if (error || !transaction) {
                setResult(fail(error ?? 'Transaction not found'));
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
        bocError,
        findTransaction,
        clearResult,
        canSearch: !loading
    };
}

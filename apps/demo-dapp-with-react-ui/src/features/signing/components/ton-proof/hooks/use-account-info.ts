import { useCallback, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

import {
    fail,
    ok,
    type OperationResult
} from '../../../../../core/components/shared/result-block/index';
import { TonProofApi } from '../../../../../core/utils/ton-proof-demo-api';

export function useAccountInfo() {
    const wallet = useTonWallet();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const fetchAccountInfo = useCallback(async () => {
        if (!wallet) {
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await TonProofApi.getAccountInfo(wallet.account);
            if (response && typeof response === 'object' && 'error' in response) {
                setResult(fail(response));
            } else {
                setResult(ok(response));
            }
        } catch (error) {
            setResult(fail(error));
        } finally {
            setLoading(false);
        }
    }, [wallet]);

    const clearResult = useCallback(() => setResult(null), []);

    return { wallet, loading, result, fetchAccountInfo, clearResult };
}

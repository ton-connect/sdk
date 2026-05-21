import type { Account, SendTransactionRequest } from '@tonconnect/ui-react';

import '../../../../../patch-local-storage-for-github-pages';

const apiHost = document.baseURI.replace(/\/$/, '');

export async function fetchMerkleProofTransaction(
    account: Account
): Promise<{
    transaction?: SendTransactionRequest;
    error?: string;
}> {
    try {
        const response = await fetch(`${apiHost}/api/merkle_proof`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: account.address,
                network: account.chain
            })
        });
        const data = await response.json();

        if (!response.ok) {
            return {
                error: typeof data?.error === 'string' ? data.error : 'Request failed'
            };
        }

        if (data && typeof data === 'object' && 'error' in data) {
            return { error: String(data.error) };
        }

        return { transaction: data as SendTransactionRequest };
    } catch (e) {
        return {
            error: e instanceof Error ? e.message : 'Unknown error'
        };
    }
}

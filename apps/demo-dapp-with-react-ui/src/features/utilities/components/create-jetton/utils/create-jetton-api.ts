import type { Account, SendTransactionRequest } from '@tonconnect/ui-react';

import '../../../../../patch-local-storage-for-github-pages';

import type { CreateJettonRequestDto } from '../../../../../server/dto/create-jetton-request-dto';

const apiHost = document.baseURI.replace(/\/$/, '');

export async function fetchCreateJettonTransaction(
    account: Account,
    jetton: CreateJettonRequestDto
): Promise<{ transaction?: SendTransactionRequest; error?: string }> {
    try {
        const response = await fetch(`${apiHost}/api/create_jetton`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address: account.address,
                network: account.chain,
                ...jetton
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

import type { SendTransactionRequest } from '@tonconnect/ui-react';

import '../../../patch-local-storage-for-github-pages';

import type { CreateJettonRequestDto } from '../../../server/dto/create-jetton-request-dto';

import { getDemoAccessToken } from './demo-session';

const apiHost = document.baseURI.replace(/\/$/, '');

export async function fetchCreateJettonTransaction(
    jetton: CreateJettonRequestDto
): Promise<{ transaction?: SendTransactionRequest; error?: string }> {
    const token = getDemoAccessToken();
    if (!token) {
        return { error: 'Authenticate on the Ton proof page first' };
    }

    try {
        const response = await fetch(`${apiHost}/api/create_jetton`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jetton)
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

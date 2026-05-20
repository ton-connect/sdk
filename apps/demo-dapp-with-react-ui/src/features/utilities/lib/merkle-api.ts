import type { Account, SendTransactionRequest } from '@tonconnect/ui-react';
import { decodeJwt } from 'jose';

import '../../../patch-local-storage-for-github-pages';

import { DEMO_ACCESS_TOKEN_KEY } from './merkle-demo-constants';

const apiHost = document.baseURI.replace(/\/$/, '');

export function hasMerkleProofSession(account: Account): boolean {
    const token = localStorage.getItem(DEMO_ACCESS_TOKEN_KEY);
    if (!token) {
        return false;
    }

    try {
        const payload = decodeJwt(token) as { address?: string; network?: string };
        return payload.address === account.address && payload.network === account.chain;
    } catch {
        return false;
    }
}

export async function fetchMerkleProofTransaction(): Promise<{
    transaction?: SendTransactionRequest;
    error?: string;
}> {
    const token = localStorage.getItem(DEMO_ACCESS_TOKEN_KEY);
    if (!token) {
        return { error: 'Authenticate on the Ton proof page first' };
    }

    try {
        const response = await fetch(`${apiHost}/api/merkle_proof`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: ''
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

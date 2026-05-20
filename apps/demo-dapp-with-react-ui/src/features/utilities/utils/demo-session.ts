import type { Account } from '@tonconnect/ui-react';
import { decodeJwt } from 'jose';

/** localStorage key for the demo backend JWT (issued after ton_proof). */
export const DEMO_ACCESS_TOKEN_KEY = 'demo-api-access-token';

export function hasDemoSession(account: Account): boolean {
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

export function getDemoAccessToken(): string | null {
    return localStorage.getItem(DEMO_ACCESS_TOKEN_KEY);
}

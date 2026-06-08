import '../../../../../patch-local-storage-for-github-pages';
import { parseApiResponse } from '../../../../../core/utils/parse-api-response';

const apiHost = document.baseURI.replace(/\/$/, '');

export type FindTxNetwork = 'mainnet' | 'testnet';

/**
 * Resolves a transaction by external-in BOC via the demo server API.
 * Dev: Vite middleware `dev-find-transaction-api-plugin.ts`.
 * Vercel: `api/find_transaction_by_external_message.ts`.
 */
export async function findTransactionByExternalMessage(
    boc: string,
    network: FindTxNetwork
): Promise<{ transaction?: unknown; error?: string }> {
    try {
        const response = await fetch(`${apiHost}/api/find_transaction_by_external_message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ boc, network })
        });

        const { data, error: parseError } = await parseApiResponse<{
            transaction?: unknown;
            error?: string;
        }>(response);

        if (parseError) {
            return { error: parseError };
        }

        const payload = data!;

        if (!response.ok) {
            return {
                error: typeof payload.error === 'string' ? payload.error : 'Transaction not found'
            };
        }

        if ('error' in payload && payload.error) {
            return { error: String(payload.error) };
        }

        return { transaction: payload.transaction };
    } catch (e) {
        return {
            error: e instanceof Error ? e.message : 'Unknown error'
        };
    }
}

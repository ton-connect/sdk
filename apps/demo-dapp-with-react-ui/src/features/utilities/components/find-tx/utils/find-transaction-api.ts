import '../../../../../patch-local-storage-for-github-pages';

export type FindTxNetwork = 'mainnet' | 'testnet';

const apiHost = document.baseURI.replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 45_000;

export async function findTransactionByExternalMessage(
    boc: string,
    network: FindTxNetwork
): Promise<{ transaction?: unknown; error?: string }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(`${apiHost}/api/find_transaction_by_external_message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ boc, network }),
            signal: controller.signal
        });
        const data = await response.json();

        if (!response.ok) {
            return {
                error: typeof data?.error === 'string' ? data.error : 'Request failed'
            };
        }

        if (!data.transaction) {
            return { error: 'Transaction not found' };
        }

        return { transaction: data.transaction };
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            return { error: 'Request timed out' };
        }
        return {
            error: e instanceof Error ? e.message : 'Unknown error'
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

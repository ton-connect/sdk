import {
    findTransactionByExternalMessageService,
    FindTransactionError,
    type FindTxNetwork
} from '../../../../../server/services/find-transaction-by-external-message-service';

export type { FindTxNetwork };

/**
 * Resolves a transaction by external-in BOC via TonAPI in the browser (CORS-safe).
 * MSW / Vercel handlers call the same service with TonCenter on the server side.
 */
export async function findTransactionByExternalMessage(
    boc: string,
    network: FindTxNetwork
): Promise<{ transaction?: unknown; error?: string }> {
    try {
        const { transaction } = await findTransactionByExternalMessageService(boc, network);
        return { transaction };
    } catch (e) {
        if (e instanceof FindTransactionError) {
            return { error: e.message };
        }

        return {
            error: e instanceof Error ? e.message : 'Unknown error'
        };
    }
}

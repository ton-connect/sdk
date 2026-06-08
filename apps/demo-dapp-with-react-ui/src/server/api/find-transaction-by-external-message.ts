import { HttpResponseResolver } from 'msw';

import {
    findTransactionByExternalMessageService,
    FindTransactionError,
    type FindTxNetwork
} from '../services/find-transaction-by-external-message-service';
import { badRequest, notFound, ok } from '../utils/http-utils';

/**
 * POST /api/find_transaction_by_external_message
 * Body: { boc: string, network: 'mainnet' | 'testnet' }
 * Returns: { transaction: any | undefined }
 */
export const findTransactionByExternalMessage: HttpResponseResolver = async ({ request }) => {
    try {
        const body = (await request.json()) as { boc?: unknown; network?: unknown };
        const boc = body.boc;
        const network = body.network;
        if (typeof boc !== 'string' || (network !== 'mainnet' && network !== 'testnet')) {
            return badRequest({ error: 'Invalid request body' });
        }

        const { transaction } = await findTransactionByExternalMessageService(
            boc,
            network as FindTxNetwork
        );
        return ok({ transaction });
    } catch (e) {
        if (e instanceof FindTransactionError) {
            if (e.statusCode === 404) {
                return notFound({ error: e.message });
            }
            return badRequest({ error: e.message });
        }

        return badRequest({
            error: 'Invalid request',
            trace: e instanceof Error ? e.message : e
        });
    }
};

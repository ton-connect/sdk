import { Cell, loadMessage } from '@ton/core';
import type { Transaction as TonApiTransaction } from '@ton-api/client';
import { TonApiClient } from '@ton-api/client';

import { getNormalizedExtMessageHash, retry } from '../utils/transactions-utils';

export type FindTxNetwork = 'mainnet' | 'testnet';

const tonApiBaseUrl = (network: FindTxNetwork) =>
    network === 'testnet' ? 'https://testnet.tonapi.io' : 'https://tonapi.io';

export class FindTransactionError extends Error {
    constructor(
        message: string,
        readonly statusCode: 400 | 404 = 400
    ) {
        super(message);
        this.name = 'FindTransactionError';
    }
}

function isTonApiNotFound(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const status = (error as { status?: number }).status;
    if (status === 404) {
        return true;
    }

    const message =
        (error as { error?: string; message?: string }).error ?? (error as Error).message;
    return typeof message === 'string' && /not found|404/i.test(message);
}

function parseExternalInMessageHashHex(boc: string): string {
    const inMessage = loadMessage(Cell.fromBase64(boc).beginParse());

    if (inMessage.info.type !== 'external-in') {
        throw new FindTransactionError(`Message must be "external-in", got ${inMessage.info.type}`);
    }

    return getNormalizedExtMessageHash(inMessage).toString('hex');
}

async function getTransactionByInMessageTonApi(
    inMessageBoc: string,
    network: FindTxNetwork
): Promise<TonApiTransaction | undefined> {
    const msgHashHex = parseExternalInMessageHashHex(inMessageBoc);
    const client = new TonApiClient({ baseUrl: tonApiBaseUrl(network) });

    try {
        return await retry(
            () => client.blockchain.getBlockchainTransactionByMessageHash(msgHashHex),
            { delay: 1000, retries: 3 }
        );
    } catch (error) {
        if (isTonApiNotFound(error)) {
            return undefined;
        }
        throw error;
    }
}

export async function findTransactionByExternalMessageService(
    boc: string,
    network: FindTxNetwork
): Promise<{ transaction: TonApiTransaction }> {
    const transaction = await getTransactionByInMessageTonApi(boc, network);

    if (!transaction) {
        throw new FindTransactionError('Transaction not found for this external-in message', 404);
    }

    return { transaction };
}

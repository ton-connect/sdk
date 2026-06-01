import { Cell, loadMessage, loadTransaction, type Transaction } from '@ton/core';
import { TonClient } from '@ton/ton';
import { TonApiClient } from '@ton-api/client';

import { getNormalizedExtMessageHash, retry } from '../utils/transactions-utils';

/** Cap pagination so the demo cannot scan an entire busy account forever. */
const MAX_SCAN_PAGES = 25;
const TX_PAGE_SIZE = 10;

export type FindTxNetwork = 'mainnet' | 'testnet';

const toncenterEndpoint = (network: FindTxNetwork) =>
    `https://${network === 'testnet' ? 'testnet.' : ''}toncenter.com/api/v2/jsonRPC`;

const tonApiBaseUrl = (network: FindTxNetwork) =>
    network === 'testnet' ? 'https://testnet.tonapi.io' : 'https://tonapi.io';

/** Main thread has `document`; service worker / Node do not. */
const isBrowserMainThread = typeof window !== 'undefined' && typeof document !== 'undefined';

export class FindTransactionError extends Error {
    constructor(
        message: string,
        readonly statusCode: 400 | 404 = 400
    ) {
        super(message);
        this.name = 'FindTransactionError';
    }
}

function parseExternalInMessage(boc: string) {
    const inMessage = loadMessage(Cell.fromBase64(boc).beginParse());

    if (inMessage.info.type !== 'external-in') {
        throw new FindTransactionError(
            `Message must be "external-in", got ${inMessage.info.type}`
        );
    }

    return {
        account: inMessage.info.dest,
        targetInMessageHash: getNormalizedExtMessageHash(inMessage)
    };
}

function matchesTargetHash(transaction: Transaction, targetInMessageHash: Buffer): boolean {
    if (transaction.inMessage?.info.type !== 'external-in') {
        return false;
    }

    const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
    return inMessageHash.equals(targetInMessageHash);
}

async function getTransactionByInMessageTonCenter(
    inMessageBoc: string,
    client: TonClient
): Promise<Transaction | undefined> {
    const { account, targetInMessageHash } = parseExternalInMessage(inMessageBoc);

    let lt: string | undefined;
    let hash: string | undefined;

    for (let page = 0; page < MAX_SCAN_PAGES; page++) {
        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    hash,
                    lt,
                    limit: TX_PAGE_SIZE,
                    archival: true
                }),
            { delay: 1000, retries: 3 }
        );

        if (transactions.length === 0) {
            return undefined;
        }

        for (const transaction of transactions) {
            if (matchesTargetHash(transaction, targetInMessageHash)) {
                return transaction;
            }
        }

        const last = transactions.at(-1)!;
        lt = last.lt.toString();
        hash = last.hash().toString('base64');
    }

    return undefined;
}

async function getTransactionByInMessageTonApi(
    inMessageBoc: string,
    network: FindTxNetwork
): Promise<Transaction | undefined> {
    const { account, targetInMessageHash } = parseExternalInMessage(inMessageBoc);
    const client = new TonApiClient({ baseUrl: tonApiBaseUrl(network) });

    let beforeLt: bigint | undefined;

    for (let page = 0; page < MAX_SCAN_PAGES; page++) {
        const { transactions } = await retry(
            () =>
                client.blockchain.getBlockchainAccountTransactions(account, {
                    limit: TX_PAGE_SIZE,
                    before_lt: beforeLt,
                    sort_order: 'desc'
                }),
            { delay: 1000, retries: 3 }
        );

        if (transactions.length === 0) {
            return undefined;
        }

        for (const apiTx of transactions) {
            if (apiTx.inMsg?.msgType !== 'ext_in_msg') {
                continue;
            }

            const transaction = loadTransaction(apiTx.raw.beginParse());
            if (matchesTargetHash(transaction, targetInMessageHash)) {
                return transaction;
            }
        }

        beforeLt = transactions.at(-1)!.lt;
    }

    return undefined;
}

function serializeTransaction(transaction: Transaction): Record<string, unknown> {
    return {
        ...transaction,
        hash: transaction.hash().toString('base64')
    };
}

export async function findTransactionByExternalMessageService(
    boc: string,
    network: FindTxNetwork
): Promise<{ transaction: Record<string, unknown> }> {
    const transaction = isBrowserMainThread
        ? await getTransactionByInMessageTonApi(boc, network)
        : await getTransactionByInMessageTonCenter(
              boc,
              new TonClient({ endpoint: toncenterEndpoint(network) })
          );

    if (!transaction) {
        throw new FindTransactionError(
            `Transaction not found in the last ${MAX_SCAN_PAGES * TX_PAGE_SIZE} account transactions`,
            404
        );
    }

    return { transaction: serializeTransaction(transaction) };
}

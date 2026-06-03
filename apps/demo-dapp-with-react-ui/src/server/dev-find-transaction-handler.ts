import type { IncomingMessage, ServerResponse } from 'node:http';

import { jsonReplacer } from '../core/utils/json-replacer';
import {
    findTransactionByExternalMessageService,
    FindTransactionError,
    type FindTxNetwork
} from './services/find-transaction-by-external-message-service';

const API_PATH = '/api/find_transaction_by_external_message';

function readJsonBody(req: IncomingMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        req.on('end', () => {
            try {
                const raw = Buffer.concat(chunks).toString('utf8');
                resolve(raw ? JSON.parse(raw) : null);
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

function sendJson(res: ServerResponse, status: number, body: object) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body, jsonReplacer, 2));
}

/** Dev-only Vite middleware handler. Returns true if the request was handled. */
export async function handleFindTransactionDevRequest(
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
): Promise<void> {
    const url = req.url?.split('?')[0];
    if (req.method !== 'POST' || url !== API_PATH) {
        next();
        return;
    }

    try {
        const body = (await readJsonBody(req)) as { boc?: unknown; network?: unknown };
        const boc = body?.boc;
        const network = body?.network;

        if (typeof boc !== 'string' || (network !== 'mainnet' && network !== 'testnet')) {
            sendJson(res, 400, { error: 'Invalid request body' });
            return;
        }

        const { transaction } = await findTransactionByExternalMessageService(
            boc,
            network as FindTxNetwork
        );
        sendJson(res, 200, { transaction });
    } catch (error) {
        if (error instanceof FindTransactionError) {
            sendJson(res, error.statusCode, { error: error.message });
            return;
        }

        sendJson(res, 400, {
            error: 'Invalid request',
            trace: error instanceof Error ? error.message : error
        });
    }
}

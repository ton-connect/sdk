import {
    findTransactionByExternalMessageService,
    FindTransactionError,
    type FindTxNetwork
} from '../src/server/services/find-transaction-by-external-message-service';
import { jsonReplacer } from '../src/core/utils/json-replacer';

type ApiRequest = {
    method?: string;
    body?: { boc?: unknown; network?: unknown };
};

type ApiResponse = {
    status: (code: number) => {
        json: (body: unknown) => void;
        send: (body: string) => void;
        setHeader: (name: string, value: string) => void;
        end: () => void;
    };
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const boc = req.body?.boc;
        const network = req.body?.network;
        if (typeof boc !== 'string' || (network !== 'mainnet' && network !== 'testnet')) {
            res.status(400).json({ error: 'Invalid request body' });
            return;
        }

        const { transaction } = await findTransactionByExternalMessageService(
            boc,
            network as FindTxNetwork
        );

        res.status(200)
            .setHeader('Content-Type', 'application/json')
            .send(JSON.stringify({ transaction }, jsonReplacer, 2));
    } catch (e) {
        if (e instanceof FindTransactionError) {
            res.status(e.statusCode).json({ error: e.message });
            return;
        }

        res.status(400).json({
            error: 'Invalid request',
            trace: e instanceof Error ? e.message : e
        });
    }
}

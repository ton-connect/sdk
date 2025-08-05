import { Cell, loadMessage, TonClient, Transaction } from "@ton/ton";
import { getNormalizedExtMessageHash, retry } from "../utils/transactions-utils";
import { HttpResponseResolver } from "msw";
import { badRequest, notFound, ok } from "../utils/http-utils";

async function waitForTransaction(
    inMessageBoc: string,
    client: TonClient,
    retries: number = 10,
    timeout: number = 1000,
): Promise<Transaction | undefined> {
    const inMessage = loadMessage(Cell.fromBase64(inMessageBoc).beginParse());

    if (inMessage.info.type !== 'external-in') {
        throw new Error(`Message must be "external-in", got ${inMessage.info.type}`);
    }
    const account = inMessage.info.dest;

    const targetInMessageHash = getNormalizedExtMessageHash(inMessage);

    let attempt = 0;
    while (attempt < retries) {
        console.log(`Waiting for transaction to appear in network. Attempt: ${attempt}`);

        const transactions = await retry(
            () =>
                client.getTransactions(account, {
                    limit: 10,
                    archival: true,
                }),
            { delay: 1000, retries: 3 },
        );

        for (const transaction of transactions) {
            if (transaction.inMessage?.info.type !== 'external-in') {
                continue;
            }

            const inMessageHash = getNormalizedExtMessageHash(transaction.inMessage);
            if (inMessageHash.equals(targetInMessageHash)) {
                return transaction;
            }
        }

        await new Promise((resolve) => setTimeout(resolve, timeout));
    }

    return undefined;
}

export const waitForTransactionResolver: HttpResponseResolver = async ({ request }) => {
    try {
        const body = (await request.json()) as any;
        const network = body.network;
        const inMessageBoc = body.inMessageBoc;
        const client = new TonClient({
            endpoint: `https://${network === 'testnet' ? 'tesnet.' : ''}toncenter.com/api/v2/jsonRPC`,
        });
        const transaction = await waitForTransaction(inMessageBoc, client);
        if (!transaction) {
            return notFound({ error: 'Transaction not found' });
        }

        return ok({ transaction: { ...transaction, hash: transaction.hash().toString('base64') } });
    } catch (e) {
        return badRequest({ error: 'Invalid request', trace: e instanceof Error ? e.message : e });
    }
};
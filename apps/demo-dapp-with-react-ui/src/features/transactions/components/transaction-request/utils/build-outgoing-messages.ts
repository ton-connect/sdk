/** Wire-format message accepted by tonConnectUI.sendTransaction. */
export interface OutgoingMessage {
    address: string;
    amount: string;
    stateInit?: string;
    payload?: string;
}

/**
 * Build the messages array that goes to the wallet:
 *  - keep only the 4 wire fields (drop in-memory extras like `id`)
 *  - omit empty `stateInit` / `payload` so they don't pollute the request
 */
export function buildOutgoingMessages(
    items: ReadonlyArray<{
        address?: string;
        amount?: string;
        stateInit?: string;
        payload?: string;
    }>
): OutgoingMessage[] {
    return items.map(msg => {
        const out: OutgoingMessage = {
            address: msg.address ?? '',
            amount: msg.amount ?? '0'
        };
        if (msg.stateInit) out.stateInit = msg.stateInit;
        if (msg.payload) out.payload = msg.payload;
        return out;
    });
}

/**
 * RPC request to sign arbitrary application data and return a wallet-provided
 * signature.
 *
 * `params[0]` is a JSON-stringified {@link SignDataPayload} — one of three
 * discriminated shapes (`text`, `binary`, `cell`).
 */
export interface SignDataRpcRequest {
    /** method discriminator */
    method: 'signData';
    /** single-element tuple: the JSON-stringified sign-data payload */
    params: [string];
    /** dApp-assigned request id; used to match the wallet response */
    id: string;
}

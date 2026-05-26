import { SignDataPayload } from '@tonconnect/protocol';

/**
 * Result of `signData` method.
 *
 * @see [Sign data (docs)](https://docs.ton.org/applications/ton-connect/how-to/sign-data)
 * @see [`signData` response (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signdata)
 */
export type SignDataResponse = {
    /** Base64-encoded Ed25519 signature. */
    signature: string;

    /** Signer's wallet address in raw form (`<workchain>:<hex>`). */
    address: string;

    /**
     * Unix epoch seconds (UTC) at signing time.
     */
    timestamp: number;

    /**
     * App domain — the URL host, without scheme or encoding.
     */
    domain: string;

    /**
     * The payload from the request, echoed back verbatim.
     */
    payload: SignDataPayload;
};

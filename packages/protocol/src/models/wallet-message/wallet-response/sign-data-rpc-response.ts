import { ChainId } from '../../CHAIN';
import { WalletResponseTemplateError } from './wallet-response-template';

/**
 * Wallet reply to a `signData` RPC.
 */
export type SignDataRpcResponse = SignDataRpcResponseSuccess | SignDataRpcResponseError;

/**
 * @see [`signData` signature (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signature--text-and-binary)
 */
export interface SignDataRpcResponseSuccess {
    result: {
        /** Base64-encoded Ed25519 signature. */
        signature: string;
        /** Raw wallet address (`<workchain>:<hex>`). */
        address: string;
        /** Unix epoch seconds (UTC) at signing time. */
        timestamp: number;
        /** App domain from manifest bound into the signature. */
        domain: string;
        /** Echo of the payload from the request. */
        payload: SignDataPayload;
    };
    /** Echo of the request `id`. */
    id: string;
}

/**
 * Discriminated payload for `signData`.
 *
 * @see [`signData` payload (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signdata)
 */
export type SignDataPayload = {
    /** Target TON network; if mismatching the wallet's active network, the wallet refuses to sign. */
    network?: ChainId;
    /** Optional signer address. */
    from?: string;
} & (SignDataPayloadText | SignDataPayloadBinary | SignDataPayloadCell);

export type SignDataPayloadText = {
    type: 'text';
    /** UTF-8 text to sign. */
    text: string;
};

export type SignDataPayloadBinary = {
    type: 'binary';
    /** Base64-encoded bytes.  */
    bytes: string;
};

export type SignDataPayloadCell = {
    type: 'cell';
    /** TL-B schema string describing the cell layout. */
    schema: string;
    /** Base64-encoded cell BoC. */
    cell: string;
};

export interface SignDataRpcResponseError extends WalletResponseTemplateError {
    error: { code: SIGN_DATA_ERROR_CODES; message: string };
    id: string;
}

/**
 * Error codes the wallet may return from `signData`.
 *
 * @see [`signData` errors (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signdata)
 */
export enum SIGN_DATA_ERROR_CODES {
    /** Unexpected wallet-side failure. */
    UNKNOWN_ERROR = 0,
    /** Invalid request payload. */
    BAD_REQUEST_ERROR = 1,
    /** Wallet does not know the dApp / session. */
    UNKNOWN_APP_ERROR = 100,
    /** User explicitly declined. */
    USER_REJECTS_ERROR = 300,
    /** Wallet does not support `signData` method or the requested `type`. */
    METHOD_NOT_SUPPORTED = 400
}

import { ChainId } from '../../CHAIN';
import { DeviceInfo } from '../../device-info';
import { WalletResponse } from '../wallet-response';
import { RpcMethod } from '../../rpc-method';

/**
 * Wallet reply to a `ConnectRequest`. Either a success
 * ({@link ConnectEventSuccess}) carrying the user's account and the
 * requested data items, or {@link ConnectEventError} when the user declines
 * or the wallet fails to fulfil the request.
 *
 * @see [`ConnectEvent` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectevent)
 */
export type ConnectEvent = ConnectEventSuccess | ConnectEventError;

/**
 * Successful connect handshake.
 *
 * Wallets that support the [`EmbeddedRequest`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/deeplinks.md#embedded-requests-e)
 * feature MAY attach the signed result of an embedded action on
 * {@link ConnectEventSuccess.response}.
 */
export interface ConnectEventSuccess {
    event: 'connect';
    /** Monotonic event id (separate counter from RPC `id`). */
    id: number;
    payload: {
        /** Replies for the {@link ConnectRequest.items}. */
        items: ConnectItemReply[];
        /** Wallet self-description and advertised capabilities. */
        device: DeviceInfo;
    };

    /**
     * Result of an embedded request that traveled in the connect URL's
     * `e` parameter. Present only when the wallet supports the
     * `EmbeddedRequest` feature and chose to process the folded request.
     *
     * @see [Embedded requests (deeplinks spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/deeplinks.md#embedded-requests-e)
     */
    response?: WalletResponse<RpcMethod>;
}

/**
 * Connect failure. The dApp should surface the matching error from
 * {@link CONNECT_EVENT_ERROR_CODES} and unwind any pending UI.
 */
export interface ConnectEventError {
    event: 'connect_error';
    id: number;
    payload: {
        code: CONNECT_EVENT_ERROR_CODES;
        message: string;
    };
}

/**
 * Error codes the wallet may return in {@link ConnectEventError}.
 *
 * @see [Connect event error codes (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connect-event-error-codes)
 */
export enum CONNECT_EVENT_ERROR_CODES {
    /** Unexpected wallet-side failure. */
    UNKNOWN_ERROR = 0,
    /** Request payload is malformed. */
    BAD_REQUEST_ERROR = 1,
    /** Wallet could not fetch the `tonconnect-manifest.json`. */
    MANIFEST_NOT_FOUND_ERROR = 2,
    /** Manifest was fetched but fails JSON / schema validation. */
    MANIFEST_CONTENT_ERROR = 3,
    /** Wallet does not know the app / session. */
    UNKNOWN_APP_ERROR = 100,
    /** User explicitly declined the connect prompt. */
    USER_REJECTS_ERROR = 300,
    /** Wallet does not support the requested method. */
    METHOD_NOT_SUPPORTED = 400
}

/**
 * Per-item reply inside {@link ConnectEventSuccess}`.payload.items`. Wallets
 * either fulfil the item or return a {@link ConnectItemReplyError} carrying a
 * {@link CONNECT_ITEM_ERROR_CODES} code (`400` when the item is unsupported).
 */
export type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

/**
 * Reply for the `ton_addr` connect item — the connected account.
 *
 * `publicKey` and `walletStateInit` are untrusted hints. Verifiers MUST
 * re-derive the public key from `walletStateInit` (or via on-chain
 * `get_public_key`) and check that `contractAddress(stateInit) === address`
 * before trusting it.
 */
export interface TonAddressItemReply {
    name: 'ton_addr';
    /** Raw TON address (`<workchain>:<hex>`). */
    address: string;
    /** TON network the account belongs to. */
    network: ChainId;
    /** Base64 BoC of the wallet contract `StateInit`. */
    walletStateInit: string;
    /** public key as a hex string (without `0x`). Untrusted. */
    publicKey: string;
}

/**
 * Reply for the `ton_proof` connect item. Either a success carrying the
 * signed proof or a per-item error when the wallet doesn't support the item.
 */
export type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

/**
 * Successful `ton_proof` reply. `proof` carries the Ed25519 signature plus
 * the bound fields needed to reconstruct the signed bytes on the verifier
 * side.
 *
 * @see [Address proof signature (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#address-proof-signature-ton_proof)
 */
export interface TonProofItemReplySuccess {
    name: 'ton_proof';
    proof: {
        /** Unix epoch seconds at signing time. */
        timestamp: number;
        /** App domain bound into the signature. */
        domain: {
            /** Length of `value` in UTF-8 bytes. */
            lengthBytes: number;
            /** Domain name, without scheme or encoding. */
            value: string;
        };
        /** dApp-provided payload (typically a server-issued nonce). */
        payload: string;
        /** Base64-encoded Ed25519 signature. */
        signature: string;
    };
}

export type TonProofItemReplyError = ConnectItemReplyError<TonProofItemReplySuccess['name']>;

/**
 * Per-item error codes returned inside a {@link ConnectItemReplyError}.
 *
 * @see [Connect item error codes (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connect-item-error-codes)
 */
export enum CONNECT_ITEM_ERROR_CODES {
    /** Unexpected wallet-side failure. */
    UNKNOWN_ERROR = 0,
    /** Wallet does not support this connect item. */
    METHOD_NOT_SUPPORTED = 400
}

/**
 * Generic per-item error envelope used inside `payload.items[]` when the
 * wallet cannot fulfil a specific item — for example a wallet that doesn't
 * implement `ton_proof` returns `{ name: 'ton_proof', error: { code: 400 } }`.
 */
export type ConnectItemReplyError<T> = {
    name: T;
    error: {
        code: CONNECT_ITEM_ERROR_CODES;
        message?: string;
    };
};

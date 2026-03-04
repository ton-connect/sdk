import { ConnectRequest } from './connect-request';
import {
    SendTransactionRpcResponse,
    SignDataPayload,
    SignDataRpcResponse,
    SignMessageRpcResponse
} from '../wallet-message';

// TODO: in protocol add sign messages as send tx and sign data
// TODO: refactor by folders

/**
 * Common fields for all intent payloads.
 *
 * Field names are shortened to keep the URL compact:
 * - `id`: intent identifier, used to match responses.
 * - `m`: intent message type discriminator.
 * - `c`: optional embedded connect request to be executed together with the intent.
 */
export interface BaseIntentPayload {
    /**
     * Intent identifier. Must be unique per dApp session and is echoed back in the wallet response.
     */
    id: string;

    /**
     * Intent message type discriminator:
     * - `txIntent` – send transaction intent;
     * - `signIntent` – sign data intent;
     * - `signMsg` – sign message intent;
     * - `actionIntent` – generic action intent.
     */
    m: 'txIntent' | 'signIntent' | 'signMsg' | 'actionIntent';

    /**
     * Optional connect request to be executed before handling the intent.
     * Allows wallets to establish a session as part of the intent flow.
     */
    c?: ConnectRequest;
}

export interface SendTransactionIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `txIntent`.
     */
    m: 'txIntent';

    /**
     * Intent processing deadline in unix epoch seconds.
     * After this moment wallets should treat the intent as expired.
     */
    vu?: number;

    /**
     * Target network identifier (e.g. `-239`, `-3`).
     * If omitted, wallet chooses its current network.
     */
    n?: string;

    /**
     * List of transfer instructions encoded as compact intent items.
     */
    i: IntentItem[];
}

export interface SignDataIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `signIntent`.
     */
    m: 'signIntent';

    /**
     * Target network identifier (e.g. `-239`, `-3`).
     */
    n?: string;

    /**
     * URL of the dApp `tonconnect-manifest.json` used for domain binding.
     */
    mu: string;

    /**
     * Payload to sign (text / binary / cell).
     */
    p: SignDataPayload;
}

export interface SignMessageIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `signMsg`.
     */
    m: 'signMsg';

    /**
     * Intent processing deadline in unix epoch seconds.
     */
    vu?: number;

    /**
     * Target network identifier (e.g. `-239`, `-3`).
     */
    n?: string;

    /**
     * Messages to build and sign as a single internal message BoC.
     */
    i: IntentItem[];
}

export interface SendActionIntentRequest extends BaseIntentPayload {
    /**
     * Must be set to `actionIntent`.
     */
    m: 'actionIntent';

    /**
     * Action URL to be handled by the wallet (e.g. deeplink or app-specific URL).
     */
    a: string;
}

export type IntentRequest =
    | SendTransactionIntentRequest
    | SignDataIntentRequest
    | SignMessageIntentRequest
    | SendActionIntentRequest;

export interface SendTonItem {
    /**
     * Item type discriminator. Must be set to `ton`.
     */
    t: 'ton';

    /**
     * Destination address in `<wc>:<hex>` format.
     */
    a: string;

    /**
     * Amount to send in nanoTON.
     */
    am: string;

    /**
     * Optional payload (base64-encoded BOC).
     */
    p?: string;

    /**
     * Optional contract state init (base64-encoded BOC).
     */
    si?: string;

    /**
     * Optional map of extra currencies to send.
     * Keys are currency IDs, values are string-encoded amounts.
     */
    ec?: Record<string, string>;
}

export interface SendJettonItem {
    /**
     * Item type discriminator. Must be set to `jetton`.
     */
    t: 'jetton';

    /**
     * Jetton master contract address.
     */
    ma: string;

    /**
     * Optional query id.
     */
    qi?: number;

    /**
     * Jetton destination address.
     */
    ja: string;

    /**
     * Jetton transfer payload (base64-encoded BOC).
     */
    d: string;

    /**
     * Optional attached TON amount in nanoTON.
     */
    am?: string;

    /**
     * Optional response destination address.
     */
    rd?: string;

    /**
     * Optional custom payload (base64-encoded BOC).
     */
    cp?: string;

    /**
     * Optional forward TON amount in nanoTON.
     */
    fta?: string;

    /**
     * Optional forward payload (base64-encoded BOC).
     */
    fp?: string;
}

export interface SendNftItem {
    /**
     * Item type discriminator. Must be set to `nft`.
     */
    t: 'nft';

    /**
     * NFT item address.
     */
    na: string;

    /**
     * Optional query id.
     */
    qi?: number;

    /**
     * New NFT owner address.
     */
    no: string;

    /**
     * Optional attached TON amount in nanoTON.
     */
    am?: string;

    /**
     * Optional response destination address.
     */
    rd?: string;

    /**
     * Optional custom payload (base64-encoded BOC).
     */
    cp?: string;

    /**
     * Optional forward TON amount in nanoTON.
     */
    fta?: string;

    /**
     * Optional forward payload (base64-encoded BOC).
     */
    fp?: string;
}

export type IntentItem = SendTonItem | SendJettonItem | SendNftItem;

export type IntentResponse =
    | SendTransactionRpcResponse
    | SignDataRpcResponse
    | SignMessageRpcResponse;

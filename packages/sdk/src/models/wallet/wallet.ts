import { DeviceInfo, TonProofItemReply } from '@tonconnect/protocol';
import { Account } from 'src/models';
import { SendTransactionResponse, SignDataResponse, SignMessageResponse } from 'src/models/methods';

/**
 * Result the wallet attached to the connect event when an
 * [embedded request](https://docs.ton.org/applications/ton-connect/how-to/embedded-request)
 * was folded into the connect URL.
 *
 * Discriminated by `ok`:
 *
 * - `ok: true` — the wallet processed the request. `result` carries the regular
 *   method response (`SendTransactionResponse`, `SignDataResponse` or
 *   `SignMessageResponse`), whichever method was embedded.
 * - `ok: false` — the wallet returned an error in place of a result. `error`
 *   matches the RPC error shape; the per-method error tables live in the
 *   [RPC specification](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md).
 */
export type EmbeddedResponse =
    | { ok: true; result: SendTransactionResponse | SignDataResponse | SignMessageResponse }
    | { ok: false; error: { code: number; message: string; data?: unknown } };

/**
 * The connected wallet as seen by the dApp. Returned by `ITonConnect.wallet`
 * and emitted on every `onStatusChange` callback after a successful connect;
 * `null` while no wallet is connected.
 *
 * @see [Connect a wallet (docs)](https://docs.ton.org/applications/ton-connect/how-to/connect)
 */
export interface Wallet {
    /**
     * Metadata reported by the wallet during the connect handshake — platform,
     * application name and version, max supported protocol version, and the
     * list of advertised features.
     *
     * @see [`DeviceInfo` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#deviceinfo)
     */
    device: DeviceInfo;

    /**
     * Transport carrying the session.
     *
     * - `'http'` — the wallet is reached through the HTTP (SSE) bridge listed in
     *   the wallets registry. dApp and wallet typically run on different devices.
     * - `'injected'` — the wallet exposes a JS bridge object on `window` (a
     *   browser extension, or the dApp running inside the wallet's webview).
     */
    provider: 'http' | 'injected';

    /**
     * Account the user picked during connect.
     */
    account: Account;

    /**
     * Replies for the optional [`ConnectItem`s](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectrequest)
     * the dApp requested in addition to `ton_addr`.
     */
    connectItems?: {
        /**
         * `ton_proof` reply, present only when the dApp requested it via {@link ConnectAdditionalRequest}.
         */
        tonProof?: TonProofItemReply;
    };

    /**
     * Result of an embedded request, when one was folded into the connect URL.
     *
     * Set only if the SDK encoded an
     * [`EmbeddedRequest`](https://docs.ton.org/applications/ton-connect/how-to/embedded-request)
     * into the connect URL, and the wallet advertises the
     * `EmbeddedRequest` feature and processed it during connect.
     *
     * Absence means the wallet completed only the connect step.
     */
    embeddedResponse?: EmbeddedResponse;
}

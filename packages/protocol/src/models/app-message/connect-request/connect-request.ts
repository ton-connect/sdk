import { ConnectItem } from './connect-item';

/**
 * First message a dApp sends to a wallet. Carried inside the connect URL —
 * not over the encrypted bridge — because the wallet is not yet connected.
 *
 * @see [`ConnectRequest` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectrequest)
 */
export interface ConnectRequest {
    /**
     * URL of the dApp's
     * [`tonconnect-manifest.json`](https://github.com/ton-blockchain/ton-connect/blob/main/spec/manifest.md).
     * The wallet fetches this file before showing the connect prompt to
     * extract the dApp's name, icon and policy URLs.
     */
    manifestUrl: string;

    /**
     * Data items the dApp wants to receive from the wallet on successful
     * connect. The wallet returns a matching reply for each item (or a
     * per-item error if unsupported). At least one entry — typically
     * `{ name: 'ton_addr' }` — is required.
     */
    items: ConnectItem[];
}

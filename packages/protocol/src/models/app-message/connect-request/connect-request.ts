import { ConnectItem } from './connect-item';

/**
 * Initial message an app sends to a wallet to establish a session. The wallet
 * fetches the manifest, presents it to the user, and on approval replies with
 * a {@link ConnectEvent}.
 */
export interface ConnectRequest {
    /** URL of the app's `tonconnect-manifest.json`. Must be publicly accessible and CORS-free. */
    manifestUrl: string;
    /** Data items the app is requesting from the wallet (e.g. `ton_addr`, `ton_proof`). */
    items: ConnectItem[];
}

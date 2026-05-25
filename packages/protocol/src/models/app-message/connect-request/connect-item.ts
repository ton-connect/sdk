import type { ChainId } from '../../CHAIN';

/**
 * One entry in {@link ConnectRequest.items} — a piece of data the app wants
 * the wallet to share or sign during connection.
 */
export type ConnectItem = TonAddressItem | TonProofItem;

/**
 * Ask the wallet to share the connected TON account address.
 *
 * The wallet replies with {@link TonAddressItemReply} on success.
 */
export interface TonAddressItem {
    /** Item discriminator. */
    name: 'ton_addr';
    /**
     * Desired network `global_id`. When set, the wallet connects on this
     * network; when omitted, the wallet uses its currently selected network.
     */
    network?: ChainId;
}

/**
 * Ask the wallet to prove control of the connected account by signing
 * `payload` together with the app domain and a timestamp. The signed
 * message follows the `ton_proof` construction defined in the
 * requests-responses spec.
 *
 * The wallet replies with {@link TonProofItemReply} on success.
 */
export interface TonProofItem {
    /** Item discriminator. */
    name: 'ton_proof';
    /**
     * Arbitrary app-provided payload mixed into the signed message
     * (e.g. a server-generated nonce plus an expiration timestamp).
     */
    payload: string;
}

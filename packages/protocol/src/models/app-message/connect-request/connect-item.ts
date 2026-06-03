import type { ChainId } from '../../CHAIN';

/**
 * Data item attached to a {@link ConnectRequest}. Wallets reply to each item
 * inside `ConnectEventSuccess.payload.items`.
 *
 * The protocol defines two items:
 *
 * - {@link TonAddressItem} — required for the connect to be useful.
 * - {@link TonProofItem} — optional `ton_proof` request used for
 *   wallet authentication.
 *
 * @see [`ConnectItem` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectrequest)
 */
export type ConnectItem = TonAddressItem | TonProofItem;

export interface TonAddressItem {
    name: 'ton_addr';

    /**
     * Desired TON network global_id the dApp wants to connect on. A hint only;
     * the network-mismatch alert is enforced at request time
     * (`sendTransaction` / `signData`), not at connect.
     *
     * @see {@link ChainId}
     */
    network?: ChainId;
}

/**
 * Ask the wallet for a `ton_proof` signature binding the connected account,
 * the dApp domain and a server-issued nonce. dApps use the reply to
 * authenticate the user.
 *
 * @see [Address proof signature (`ton_proof`) (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#address-proof-signature-ton_proof)
 */
export interface TonProofItem {
    name: 'ton_proof';

    /**
     * Payload to embed in the signed message.
     */
    payload: string;
}

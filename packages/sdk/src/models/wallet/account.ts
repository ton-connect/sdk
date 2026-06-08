import { ChainId } from '@tonconnect/protocol';

/**
 * The TON account that the wallet exposed to the dApp during the connect handshake.
 *
 * One {@link Wallet} maps to exactly one `Account` for the lifetime of the session.
 * To switch accounts the user has to disconnect and reconnect from the dApp UI.
 *
 * @see [`ton_addr` reply (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#connectitemreply)
 */
export interface Account {
    /**
     * User's address in raw hex form `<workchain>:<hex>`.
     *
     * Use {@link toUserFriendlyAddress} to render the non-bounceable base64url
     * form (`UQ…` on mainnet, `0Q…` on testnet) used in user-facing UI.
     */
    address: string;

    /**
     * TON network identifier. See {@link ChainId}.
     */
    chain: ChainId;

    /**
     * Base64-encoded (not URL-safe) BoC of the wallet contract `StateInit` cell.
     *
     * @see [sign-data § Extracting the public key](https://docs.ton.org/applications/ton-connect/how-to/sign-data#extracting-the-public-key)
     */
    walletStateInit: string;

    /**
     * Ed25519 public key advertised by the wallet during connect, hex-encoded
     * **without** the `0x` prefix.
     *
     * The value is not authoritative — do not trust it directly when verifying
     * signatures. Re-derive it from {@link Account.walletStateInit} or call
     * `get_public_key` on the wallet contract instead.
     */
    publicKey?: string;
}

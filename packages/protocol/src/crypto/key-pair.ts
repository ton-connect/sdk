/**
 * Serialized form of a session keypair, used to persist a session across
 * page reloads. Both fields are hex-encoded (no `0x` prefix). Pass an
 * existing keypair into {@link SessionCrypto} to resume a session; omit it
 * to generate a fresh one.
 *
 * `client_id` on the bridge is `publicKey` itself. Keep `secretKey`
 * confidential — it grants the ability to decrypt messages addressed to
 * this client.
 *
 * @see [Client keypair (Session spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/session.md#client-keypair)
 */
export interface KeyPair {
    /** 32-byte public key, hex-encoded. */
    publicKey: string;
    /** 32-byte secret key, hex-encoded. Must be kept private. */
    secretKey: string;
}

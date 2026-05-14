/**
 * Curve25519 key pair used by the bridge session as a stable, hex-encoded
 * snapshot of the `nacl.box` keys held by {@link SessionCrypto}. Persist this
 * to storage to resume the same session after a reload.
 */
export interface KeyPair {
    /** Public key, 32 bytes as a lowercase hex string. */
    publicKey: string;
    /** Secret key, 32 bytes as a lowercase hex string. */
    secretKey: string;
}

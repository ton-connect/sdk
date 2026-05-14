import { KeyPair } from './key-pair';
import { concatUint8Arrays, hexToByteArray, splitToUint8Arrays, toHexString } from '../utils';
import nacl, { BoxKeyPair } from 'tweetnacl';

/**
 * Bridge-session crypto: a Curve25519 key pair plus authenticated
 * encryption (`nacl.box`) over messages exchanged with the wallet.
 *
 * Each instance owns one key pair. {@link sessionId} is the hex-encoded
 * public key and is used to identify the session on the bridge.
 *
 * Persist {@link stringifyKeypair} output (e.g. to `localStorage`) to
 * resume the same session after a reload; pass it back into the
 * constructor to reconstruct.
 */
export class SessionCrypto {
    private readonly nonceLength = 24;

    private readonly keyPair: BoxKeyPair;

    /** Hex-encoded public key. Used as the session identifier on the bridge. */
    public readonly sessionId: string;

    /**
     * @param keyPair previously persisted key pair (e.g. from
     * {@link stringifyKeypair}). Omit to generate a fresh pair.
     */
    constructor(keyPair?: KeyPair) {
        this.keyPair = keyPair ? this.createKeypairFromString(keyPair) : this.createKeypair();
        this.sessionId = toHexString(this.keyPair.publicKey);
    }

    private createKeypair(): BoxKeyPair {
        return nacl.box.keyPair();
    }

    private createKeypairFromString(keyPair: KeyPair): BoxKeyPair {
        return {
            publicKey: hexToByteArray(keyPair.publicKey),
            secretKey: hexToByteArray(keyPair.secretKey)
        };
    }

    private createNonce(): Uint8Array {
        return nacl.randomBytes(this.nonceLength);
    }

    /**
     * Encrypt a UTF-8 string for `receiverPublicKey` using `nacl.box` with a
     * fresh random nonce. The 24-byte nonce is prepended to the ciphertext —
     * {@link decrypt} expects the same layout.
     *
     * @param message plain-text payload (typically a JSON-encoded RPC request).
     * @param receiverPublicKey peer's Curve25519 public key (32 bytes).
     * @returns `nonce(24 bytes) || ciphertext`.
     */
    public encrypt(message: string, receiverPublicKey: Uint8Array): Uint8Array {
        const encodedMessage = new TextEncoder().encode(message);
        const nonce = this.createNonce();
        const encrypted = nacl.box(
            encodedMessage,
            nonce,
            receiverPublicKey,
            this.keyPair.secretKey
        );
        return concatUint8Arrays(nonce, encrypted);
    }

    /**
     * Decrypt a message produced by {@link encrypt} (or the wallet's
     * equivalent). The input is `nonce(24 bytes) || ciphertext` and the
     * authentication tag is verified by `nacl.box.open`.
     *
     * @param message ciphertext prefixed with the 24-byte nonce.
     * @param senderPublicKey peer's Curve25519 public key (32 bytes).
     * @returns the original UTF-8 plaintext.
     * @throws {Error} when authentication fails (wrong key, corrupted bytes).
     */
    public decrypt(message: Uint8Array, senderPublicKey: Uint8Array): string {
        const [nonce, internalMessage] = splitToUint8Arrays(message, this.nonceLength);

        const decrypted = nacl.box.open(
            internalMessage,
            nonce,
            senderPublicKey,
            this.keyPair.secretKey
        );

        if (!decrypted) {
            throw new Error(
                `Decryption error: \n message: ${message.toString()} \n sender pubkey: ${senderPublicKey.toString()} \n keypair pubkey: ${this.keyPair.publicKey.toString()} \n keypair secretkey: ${this.keyPair.secretKey.toString()}`
            );
        }

        return new TextDecoder().decode(decrypted);
    }

    /**
     * Export the underlying key pair as hex strings — safe to JSON-encode and
     * persist (e.g. to `localStorage`). Pass the result back into the
     * {@link SessionCrypto} constructor to resume the same session.
     */
    public stringifyKeypair(): KeyPair {
        return {
            publicKey: toHexString(this.keyPair.publicKey),
            secretKey: toHexString(this.keyPair.secretKey)
        };
    }
}

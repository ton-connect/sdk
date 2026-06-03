import { KeyPair } from './key-pair';
import { concatUint8Arrays, hexToByteArray, splitToUint8Arrays, toHexString } from '../utils';
import nacl, { BoxKeyPair } from 'tweetnacl';

/**
 * Implements the TON Connect session-encryption protocol on top of NaCl's
 * `crypto_box`.
 *
 * The protocol is symmetric: each side encrypts the messages it sends and
 * decrypts the messages it receives. On the dApp side that means encrypting
 * outgoing {@link AppMessage} and decrypting incoming {@link WalletMessage};
 * the wallet does the reverse.
 *
 * @example
 * ```ts
 * import { SessionCrypto, Base64, hexToByteArray } from '@tonconnect/protocol';
 *
 * // Generate a fresh session
 * const session = new SessionCrypto();
 * const myClientId = session.sessionId;  // hex public key (sent to the peer)
 *
 * // Encrypt an outgoing message for the peer
 * const ciphertext = session.encrypt(
 *     JSON.stringify(message),
 *     hexToByteArray(peerClientId)
 * );
 *
 * // Decrypt an incoming message from the peer
 * const plaintext = session.decrypt(
 *     Base64.decode(bridgeMessage.message).toUint8Array(),
 *     hexToByteArray(bridgeMessage.from)
 * );
 * ```
 *
 * @see [Session protocol (Session spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/session.md)
 */
export class SessionCrypto {
    private readonly nonceLength = 24;

    private readonly keyPair: BoxKeyPair;

    /**
     * Bridge-level `client_id` — the public key as a 64-character
     * lowercase hex string. Share with the peer during connect; treat as
     * semi-private (do not publish broadly).
     */
    public readonly sessionId: string;

    /**
     * Reuse an existing {@link KeyPair} (resuming a session) or generate a
     * fresh one (`crypto_box.keyPair()`) when omitted.
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
     * Encrypt `message` for `receiverPublicKey` using a fresh 24-byte random
     * nonce. Returns `nonce || ciphertext` as raw bytes; base64-encode this
     * value before placing it in the bridge `POST /message` body.
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
     * Decrypt the `nonce || ciphertext` blob received from the bridge.
     * Throws if `nacl.box.open` rejects the message — wrong key, truncated
     * input or tampered ciphertext.
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
     * Export the underlying keypair as a {@link KeyPair} of hex strings.
     * Persist this in dApp / wallet storage to resume the session later.
     */
    public stringifyKeypair(): KeyPair {
        return {
            publicKey: toHexString(this.keyPair.publicKey),
            secretKey: toHexString(this.keyPair.secretKey)
        };
    }
}

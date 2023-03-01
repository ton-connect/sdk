import { KeyPair } from './key-pair';
import { concatUint8Arrays, hexToByteArray, splitToUint8Arrays, toHexString } from '../utils';
import nacl, { BoxKeyPair } from 'tweetnacl';

export class SessionCrypto {
    private readonly nonceLength = 24;

    private readonly keyPair: BoxKeyPair;

    public readonly sessionId: string;

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

    public stringifyKeypair(): KeyPair {
        return {
            publicKey: toHexString(this.keyPair.publicKey),
            secretKey: toHexString(this.keyPair.secretKey)
        };
    }
}

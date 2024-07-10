import { KeyPair } from './key-pair';
export declare class SessionCrypto {
    private readonly nonceLength;
    private readonly keyPair;
    readonly sessionId: string;
    constructor(keyPair?: KeyPair);
    private createKeypair;
    private createKeypairFromString;
    private createNonce;
    encrypt(message: string, receiverPublicKey: Uint8Array): Uint8Array;
    decrypt(message: Uint8Array, senderPublicKey: Uint8Array): string;
    stringifyKeypair(): KeyPair;
}

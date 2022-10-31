import { SessionCrypto } from 'src/crypto';
import { hexToByteArray } from 'src/utils';

describe('Session Crypto tests', () => {
    it('Should generate random keyPair', () => {
        const sessionCrypto1 = new SessionCrypto();
        const sessionCrypto2 = new SessionCrypto();

        expect(sessionCrypto1.sessionId).not.toEqual(sessionCrypto2.sessionId);
    });

    it('Should correctly serialize session keypair', () => {
        const sessionCrypto = new SessionCrypto();

        const keypair = sessionCrypto.stringifyKeypair();

        const newSessionCrypto = new SessionCrypto(keypair);

        expect(newSessionCrypto.sessionId).toEqual(sessionCrypto.sessionId);
    });

    it('Should correctly serialize session keypair', () => {
        const fromSessionCrypto = new SessionCrypto();
        const toSessionCrypto = new SessionCrypto();
        const message = 'some protocol message: { method_params: [1, 2, null] }';

        const encrypted = fromSessionCrypto.encrypt(
            message,
            hexToByteArray(toSessionCrypto.sessionId)
        );
        const decrypted = toSessionCrypto.decrypt(
            encrypted,
            hexToByteArray(fromSessionCrypto.sessionId)
        );

        expect(decrypted).toEqual(message);
    });
});

import { signVerify } from '@ton/crypto';
import { domainSignVerify } from '@ton/ton';
import { Buffer } from 'buffer';
import { getDomain } from '../utils/domain';

export type SignerMode = 'domain-signature' | 'mixed';

const allowedDomains = [
    'ton-connect.github.io',
    'localhost:5173',
    'localhost',
    'tonconnect-sdk-demo-dapp.vercel.app'
];

const validAuthTime = 15 * 60; // 15 minutes

type VerifyParams = {
    domain: string;
    timestamp: number;
    network: string;
    data: Buffer;
    signature: Buffer;
    publicKey: Buffer;
};

export class SignatureVerificationService {
    private mode: SignerMode = 'domain-signature';

    public getMode(): SignerMode {
        return this.mode;
    }

    public setMode(mode: SignerMode): void {
        this.mode = mode;
    }

    public verifyDomain({
        domain,
        timestamp
    }: Pick<VerifyParams, 'domain' | 'timestamp'>): boolean {
        if (!allowedDomains.includes(domain)) {
            return false;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now - validAuthTime > timestamp) {
            return false;
        }

        return true;
    }

    public verifySignature(params: VerifyParams): boolean {
        if (!this.verifyDomain(params)) {
            return false;
        }

        const { network, data, signature, publicKey } = params;

        if (this.mode === 'domain-signature') {
            return domainSignVerify({
                data,
                signature,
                publicKey,
                domain: getDomain(network)
            });
        }

        return signVerify(data, signature, publicKey);
    }
}

const signatureVerificationService = new SignatureVerificationService();

export function getSignerMode(): SignerMode {
    return signatureVerificationService.getMode();
}

export function setSignerMode(mode: SignerMode): void {
    signatureVerificationService.setMode(mode);
}

export function verifySignature(params: VerifyParams): boolean {
    return signatureVerificationService.verifySignature(params);
}

export { signatureVerificationService };

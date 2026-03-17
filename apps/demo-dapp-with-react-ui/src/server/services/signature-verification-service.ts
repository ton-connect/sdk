import { signVerify } from '@ton/crypto';
import { domainSignVerify } from '@ton/ton';
import { Buffer } from 'buffer';
import { getDomain } from '../utils/domain';

export type SignerMode = 'tetra' | 'mixed';

const allowedDomains = [
    'ton-connect.github.io',
    'localhost:5173',
    'localhost',
    'tonconnect-sdk-demo-dapp.vercel.app'
];

const validAuthTime = 15 * 60; // 15 minutes

let currentSignerMode: SignerMode = 'mixed';

export function getSignerMode(): SignerMode {
    return currentSignerMode;
}

export function setSignerMode(mode: SignerMode): void {
    currentSignerMode = mode;
}

type VerifyParams = {
    domain: string;
    timestamp: number;
    network: string;
    data: Buffer;
    signature: Buffer;
    publicKey: Buffer;
};

export function verifySignature({
    domain,
    timestamp,
    network,
    data,
    signature,
    publicKey
}: VerifyParams): boolean {
    if (!allowedDomains.includes(domain)) {
        return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - validAuthTime > timestamp) {
        return false;
    }

    if (currentSignerMode === 'tetra') {
        return signVerify(data, signature, publicKey);
    }

    return domainSignVerify({
        data,
        signature,
        publicKey,
        domain: getDomain(network)
    });
}

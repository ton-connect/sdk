import { Buffer } from 'buffer';

export function encodeDomainDnsLike(domain: string): Buffer {
    const parts = domain.split('.').reverse();
    const encoded: number[] = [];

    for (const part of parts) {
        // Add the part characters
        for (let i = 0; i < part.length; i++) {
            encoded.push(part.charCodeAt(i));
        }
        encoded.push(0);
    }

    return Buffer.from(encoded);
}

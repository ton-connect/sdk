import { DappMetadata } from 'src/ton-connect';
import { Wallet } from 'src/ton-connect/core/models/wallet';

export class Session {
    constructor(
        public readonly wallet: Wallet,
        public readonly sessionId: string,
        public readonly pk: string,
        public readonly sk: string,
        public readonly dappMetadata: DappMetadata,
        public readonly protocolVersion: string
    ) {}

    public generateUniversalLink(): string {
        const url = new URL(this.wallet.universalLinkBase);
        url.searchParams.append('sessionId', this.sessionId);
        url.searchParams.append('pk', this.pk);
        url.searchParams.append('metadata', JSON.stringify(this.dappMetadata));
        url.searchParams.append('version', this.protocolVersion);
        return url.toString();
    }
}

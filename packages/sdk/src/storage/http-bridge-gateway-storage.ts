import { IStorage } from 'src/storage/models/storage.interface';

export class HttpBridgeGatewayStorage {
    private readonly storeKey: string;

    constructor(private readonly storage: IStorage, bridgeUrl: string) {
        this.storeKey = 'ton-connect-storage_http-bridge-gateway::' + bridgeUrl;
    }

    public async storeLastEventId(lastEventId: string): Promise<void> {
        return this.storage.setItem(this.storeKey, lastEventId);
    }

    public async removeLastEventId(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }

    public async getLastEventId(): Promise<string | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }

        return stored;
    }
}

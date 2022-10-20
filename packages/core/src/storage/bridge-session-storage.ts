import { BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { IStorage } from 'src/storage/models/storage.interface';

export class BridgeSessionStorage {
    private readonly storeKey = 'ton-connect-storage';

    constructor(private readonly storage: IStorage) {}

    public async storeSession(session: BridgeSession): Promise<void> {
        return this.storage.setItem(this.storeKey, JSON.stringify(session));
    }

    public async removeSession(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }

    public async getSession(): Promise<BridgeSession | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }

        return JSON.parse(stored);
    }
}

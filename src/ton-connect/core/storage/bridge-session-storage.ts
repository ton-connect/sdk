import { Session } from 'src/ton-connect/core/session';
import { DefaultStorage } from 'src/ton-connect/core/storage/default-storage';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';
import { AsStruct } from 'src/ton-connect/utils/types';

export class BridgeSessionStorage {
    private readonly storeKey = 'ton-connect-storage';

    private readonly storage: IStorage;

    constructor(storage?: IStorage) {
        this.storage = storage || new DefaultStorage();
    }

    public async storeSession(session: Session): Promise<void> {
        return this.storage.setItem(this.storeKey, JSON.stringify(session));
    }

    public async removeSession(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }

    public async getSession(): Promise<Session | null> {
        const stored = await this.storage.getItem(this.storeKey);
        if (!stored) {
            return null;
        }

        const sessionStruct: AsStruct<Session> = JSON.parse(stored);
        return new Session(
            sessionStruct.wallet,
            sessionStruct.sessionId,
            sessionStruct.pk,
            sessionStruct.sk,
            sessionStruct.dappMetadata
        );
    }
}

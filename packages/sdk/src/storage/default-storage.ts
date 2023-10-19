import { IStorage } from 'src/storage/models/storage.interface';
import { tryGetLocalStorage } from 'src/utils/web-api';

/**
 * Default storage to save protocol data, uses `localStorage` if it is available, for Safari in private mode and Node.js it uses `InMemoryStorage`.
 */
export class DefaultStorage implements IStorage {
    private readonly localStorage: Storage;

    constructor() {
        this.localStorage = tryGetLocalStorage();
    }

    public async getItem(key: string): Promise<string | null> {
        return this.localStorage.getItem(key);
    }

    public async removeItem(key: string): Promise<void> {
        this.localStorage.removeItem(key);
    }

    public async setItem(key: string, value: string): Promise<void> {
        this.localStorage.setItem(key, value);
    }
}

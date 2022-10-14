import { LocalstorageNotFoundError } from 'src/errors/ton-connect/storage/localstorage-not-found.error';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';

export class DefaultStorage implements IStorage {
    constructor() {
        if (!window?.localStorage) {
            throw new LocalstorageNotFoundError();
        }
    }

    public async getItem(key: string): Promise<string | null> {
        return Promise.resolve(window.localStorage.getItem(key));
    }

    public async removeItem(key: string): Promise<void> {
        window.localStorage.removeItem(key);
        return Promise.resolve();
    }

    setItem(key: string, value: string): Promise<void> {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
    }
}

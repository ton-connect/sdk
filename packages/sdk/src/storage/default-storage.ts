import { LocalstorageNotFoundError } from 'src/errors/storage/localstorage-not-found.error';
import { IStorage } from 'src/storage/models/storage.interface';
import { getWindow } from 'src/utils/web-api';

export class DefaultStorage implements IStorage {
    private readonly window: Window;

    constructor() {
        const window = getWindow();

        if (!window?.localStorage) {
            throw new LocalstorageNotFoundError();
        }

        this.window = window;
    }

    public async getItem(key: string): Promise<string | null> {
        return Promise.resolve(this.window.localStorage.getItem(key));
    }

    public async removeItem(key: string): Promise<void> {
        this.window.localStorage.removeItem(key);
        return Promise.resolve();
    }

    setItem(key: string, value: string): Promise<void> {
        this.window.localStorage.setItem(key, value);
        return Promise.resolve();
    }
}

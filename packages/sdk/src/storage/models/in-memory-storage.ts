/**
 * In memory storage like localStorage, but without persistence.
 * Uses as a fallback for localStorage in Safari's private mode.
 */
export class InMemoryStorage implements Storage {
    private static instance: InMemoryStorage;

    private storage: Record<string, string> = {};

    public static getInstance(): InMemoryStorage {
        if (!InMemoryStorage.instance) {
            InMemoryStorage.instance = new InMemoryStorage();
        }

        return InMemoryStorage.instance;
    }

    private constructor() {}

    public get length(): number {
        return Object.keys(this.storage).length;
    }

    public clear(): void {
        this.storage = {};
    }

    public getItem(key: string): string | null {
        return this.storage[key] ?? null;
    }

    public key(index: number): string | null {
        const keys = Object.keys(this.storage);
        if (index < 0 || index >= keys.length) {
            return null;
        }

        return keys[index] ?? null;
    }

    public removeItem(key: string): void {
        delete this.storage[key];
    }

    public setItem(key: string, value: string): void {
        this.storage[key] = value;
    }
}

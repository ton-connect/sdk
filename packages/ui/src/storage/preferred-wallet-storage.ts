import { checkLocalStorageExists } from 'src/app/utils/web-api';

export class PreferredWalletStorage {
    private readonly localStorage: Storage;

    private readonly storageKey = 'ton-connect-ui_preferred-wallet';

    constructor() {
        checkLocalStorageExists();

        this.localStorage = localStorage;
    }

    public setPreferredWalletName(name: string): void {
        this.localStorage.setItem(this.storageKey, name);
    }

    public getPreferredWalletName(): string | undefined {
        return this.localStorage.getItem(this.storageKey) || undefined;
    }
}

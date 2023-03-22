import { WalletInfoWithOpenMethod } from 'src/models/connected-wallet';
import { checkLocalStorageExists } from 'src/app/utils/web-api';

export class WalletInfoStorage {
    private readonly localStorage: Storage;

    private readonly storageKey = 'ton-connect-ui_wallet-info';

    constructor() {
        checkLocalStorageExists();

        this.localStorage = localStorage;
    }

    public setWalletInfo(walletInfo: WalletInfoWithOpenMethod): void {
        this.localStorage.setItem(this.storageKey, JSON.stringify(walletInfo));
    }

    public getWalletInfo(): WalletInfoWithOpenMethod | null {
        const walletInfoString = this.localStorage.getItem(this.storageKey);

        if (!walletInfoString) {
            return null;
        }

        return JSON.parse(walletInfoString);
    }

    public removeWalletInfo(): void {
        this.localStorage.removeItem(this.storageKey);
    }
}

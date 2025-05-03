import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { tryGetLocalStorage } from 'src/app/utils/web-api';

export class LastSelectedWalletInfoStorage {
    private readonly localStorage: Storage;

    private readonly storageKey = 'ton-connect-ui_last-selected-wallet-info';

    constructor() {
        this.localStorage = tryGetLocalStorage();
    }

    public setLastSelectedWalletInfo(
        walletInfo:
            | WalletInfoWithOpenMethod
            | {
                  openMethod: WalletOpenMethod;
              }
    ): void {
        this.localStorage.setItem(this.storageKey, JSON.stringify(walletInfo));
    }

    public getLastSelectedWalletInfo():
        | WalletInfoWithOpenMethod
        | {
              openMethod: WalletOpenMethod;
          }
        | null {
        const walletInfoString = this.localStorage.getItem(this.storageKey);

        if (!walletInfoString) {
            return null;
        }

        return JSON.parse(walletInfoString);
    }

    public removeLastSelectedWalletInfo(): void {
        this.localStorage.removeItem(this.storageKey);
    }
}

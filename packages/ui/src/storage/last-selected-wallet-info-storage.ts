import { WalletInfoWithOpenMethod, WalletOpenMethod } from 'src/models/connected-wallet';
import { checkLocalStorageExists } from 'src/app/utils/web-api';

export class LastSelectedWalletInfoStorage {
    private readonly localStorage: Storage;

    private readonly storageKey = 'ton-connect-ui_last-selected-wallet-info';

    constructor() {
        checkLocalStorageExists();

        this.localStorage = localStorage;
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

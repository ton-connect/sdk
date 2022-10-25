import { Wallet } from 'src/models';
import { IStorage } from 'src/storage/models/storage.interface';

export class WalletInfoStorage {
    private readonly storeKey = 'ton-connect-storage_wallet-info';

    constructor(private readonly storage: IStorage) {}

    public async loadWalletInfo(): Promise<Wallet | null> {
        const data = await this.storage.getItem(this.storeKey);
        return data && JSON.parse(data);
    }

    public async saveWalletInfo(walletInfo: Wallet): Promise<void> {
        return this.storage.setItem(this.storeKey, JSON.stringify(walletInfo));
    }

    public async removeWalletInfo(): Promise<void> {
        return this.storage.removeItem(this.storeKey);
    }
}

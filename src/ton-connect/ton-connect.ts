import { SignRequest, TransactionRequest } from 'src/ton-connect/core';
import { CHAIN } from 'src/ton-connect/core/models/CHAIN';
import { WalletInfo } from 'src/ton-connect/core/models/wallet-info';

export class TonConnect {
    private _connected = false;

    private connectSubscriptions: ((walletInfo: WalletInfo) => void)[] = [];

    private accountChangeSubscriptions: ((account: string) => void)[] = [];

    private chainChangeSubscriptions: ((chain: CHAIN) => void)[] = [];

    private disconnectSubscriptions: (() => void)[] = [];

    public get connected(): boolean {
        return this._connected;
    }

    public onConnect(callback: (walletInfo: WalletInfo) => void): void {
        this.connectSubscriptions.push(callback);
    }

    public onAccountChange(callback: (account: string) => void): void {
        this.accountChangeSubscriptions.push(callback);
    }

    public onChainChange(callback: (chain: CHAIN) => void): void {
        this.chainChangeSubscriptions.push(callback);
    }

    public onDisconnect(callback: () => void): void {
        this.disconnectSubscriptions.push(callback);
    }

    public async connect(): Promise<void> {}

    public async sendTransaction(tx: TransactionRequest): Promise<boolean> {
        return Promise.resolve(Boolean(tx));
    }

    public async sign(sign: SignRequest): Promise<string> {
        return Promise.resolve(sign.message);
    }

    public disconnect(): void {}
}

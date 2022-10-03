import { WalletAlreadyConnectedError } from 'src/errors/ton-connect/wallet-already-connected.error';
import { DappMetadata, SignRequest, TransactionRequest } from 'src/ton-connect/core';
import { BridgeConnector } from 'src/ton-connect/core/bridge-connector';
import { CHAIN } from 'src/ton-connect/core/models/CHAIN';
import { Session } from 'src/ton-connect/core/session';
import { Wallet } from 'src/ton-connect/core/models/wallet';
import { WalletInfo } from 'src/ton-connect/core/models/wallet-info';
import { TonConnectStorage } from 'src/ton-connect/core/storage';

export class TonConnect {
    private readonly dappMetadata: DappMetadata;

    private readonly storage: TonConnectStorage;

    private bridgeConnector: BridgeConnector | undefined;

    private _connected = false;

    private connectSubscriptions: ((walletInfo: WalletInfo) => void)[] = [];

    private accountChangeSubscriptions: ((account: string) => void)[] = [];

    private chainChangeSubscriptions: ((chain: CHAIN) => void)[] = [];

    private disconnectSubscriptions: (() => void)[] = [];

    public get connected(): boolean {
        return this._connected;
    }

    constructor(options?: { dappMetedata?: DappMetadata; storage: TonConnectStorage }) {
        this.dappMetadata = options?.dappMetedata || this.getWebPageMetadata();
        this.storage = options?.storage || new TonConnectStorage();
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

    public onConnectedChange(callback: (isConnected: boolean) => void): void {
        this.connectSubscriptions.push(() => callback(true));
        this.disconnectSubscriptions.push(() => callback(false));
    }

    public async connect(wallet: Wallet): Promise<string> {
        if (this.connected) {
            throw new WalletAlreadyConnectedError();
        }
        const [pk, sk] = [Math.random().toString(), Math.random().toString()]; // generate keys;
        const sessionId = Math.random().toString();

        this.bridgeConnector = new BridgeConnector(wallet.bridgeLink);
        await this.bridgeConnector.registerSession(sessionId);

        const session = new Session(wallet, sessionId, pk, sk, this.dappMetadata);
        this.storage.storeSession(session);

        return session.generateUniversalLink();
    }

    public async sendTransaction(tx: TransactionRequest): Promise<boolean> {
        return Promise.resolve(Boolean(tx));
    }

    public async sign(signRequest: SignRequest): Promise<string> {
        return Promise.resolve(signRequest.message);
    }

    public disconnect(): void {}

    private getWebPageMetadata(): DappMetadata {
        return {
            url: window?.location.href,
            icon: window?.location.origin + '/favicon.ico',
            name: document?.title
        };
    }
}

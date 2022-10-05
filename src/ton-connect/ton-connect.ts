import { WalletAlreadyConnectedError } from 'src/errors/ton-connect/wallet-already-connected.error';
import { DappMetadata, SignRequest, TransactionRequest } from 'src/ton-connect/core';
import { BridgeConnector } from 'src/ton-connect/core/bridge/bridge-connector';
import { BridgeEvent } from 'src/ton-connect/core/bridge/models/bridge-event';
import { Account } from 'src/ton-connect/core/models/account';
import { Session } from 'src/ton-connect/core/session';
import { Wallet } from 'src/ton-connect/core/models/wallet';
import { WalletInfo } from 'src/ton-connect/core/models/wallet-info';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';
import { SessionStorage } from 'src/ton-connect/core/storage/session-storage';

export class TonConnect {
    private readonly protocolVersion = '0.1';

    private readonly dappMetadata: DappMetadata;

    private readonly storage: SessionStorage;

    private bridgeConnector: BridgeConnector | undefined;

    private _connected = false;

    private connectSubscriptions: ((walletInfo: WalletInfo) => void)[] = [];

    private accountChangeSubscriptions: ((account: Account) => void)[] = [];

    private disconnectSubscriptions: (() => void)[] = [];

    public get connected(): boolean {
        return this._connected;
    }

    constructor(options?: { dappMetedata?: DappMetadata; storage?: IStorage }) {
        this.dappMetadata = options?.dappMetedata || this.getWebPageMetadata();
        this.storage = new SessionStorage(options?.storage);
    }

    public onConnect(callback: (walletInfo: WalletInfo) => void): void {
        this.connectSubscriptions.push(callback);
    }

    public onAccountChange(callback: (account: Account) => void): void {
        this.accountChangeSubscriptions.push(callback);
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

        this.bridgeConnector = new BridgeConnector(wallet.bridgeLink, sessionId);
        await this.bridgeConnector.registerSession();
        this.bridgeConnector.listen(
            this.bridgeEventsListener.bind(this),
            this.bridgeErrorsListener.bind(this)
        );

        const session = new Session(
            wallet,
            sessionId,
            pk,
            sk,
            this.dappMetadata,
            this.protocolVersion
        );
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

    private bridgeEventsListener(e: BridgeEvent): void {
        switch (e.name) {
            case 'connect':
                this._connected = true;
        }
    }

    private bridgeErrorsListener(): void {}
}

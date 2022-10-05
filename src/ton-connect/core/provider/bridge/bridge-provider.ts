import { DappSettings } from 'src/ton-connect/core/models/dapp/dapp-settings';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet-connection-source';
import { BridgeGateway } from 'src/ton-connect/core/provider/bridge/bridge-gateway';
import { HTTPProvider } from 'src/ton-connect/core/provider/provider';
import { Session } from 'src/ton-connect/core/session';

export class BridgeProvider implements HTTPProvider {
    private session: Session;

    constructor(
        private readonly dappSettings: DappSettings,
        private readonly walletConnectionSource: WalletConnectionSource
    ) {}

    public async connect(): Promise<string> {
        const [pk, sk] = [Math.random().toString(), Math.random().toString()]; // generate keys;
        const sessionId = Math.random().toString();

        const bridge = new BridgeGateway(this.walletConnectionSource.bridgeLink, sessionId);
        await bridge.registerSession();
        bridge.listen(this.bridgeEventsListener.bind(this), this.bridgeErrorsListener.bind(this));

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

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void {}

    sendRequest(request: ProviderRequest): Promise<void> {
        return Promise.resolve(undefined);
    }
}

import { DappSettings } from 'src/ton-connect/core/models/dapp/dapp-settings';
import {
    ActionRequest,
    RequestType
} from 'src/ton-connect/core/models/protocol/actions/action-request';
import { ActionResponse } from 'src/ton-connect/core/models/protocol/actions/action-response';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet-connection-source';
import { BridgeGateway } from 'src/ton-connect/core/provider/bridge/bridge-gateway';
import { BridgeError } from 'src/ton-connect/core/provider/bridge/models/bridge-error';
import {
    BridgeEvent,
    BridgeEventConnect
} from 'src/ton-connect/core/provider/bridge/models/bridge-event';
import { BridgeMessage } from 'src/ton-connect/core/provider/bridge/models/bridge-message';
import { ProviderError } from 'src/ton-connect/core/provider/models/provider-error';
import { ProviderEvent } from 'src/ton-connect/core/provider/models/provider-event';
import { HTTPProvider } from 'src/ton-connect/core/provider/provider';
import {
    BridgeSession,
    BridgeSessionSeed
} from 'src/ton-connect/core/provider/bridge/models/bridge-session';
import { BridgeSessionStorage } from 'src/ton-connect/core/storage/bridge-session-storage';

export class BridgeProvider implements HTTPProvider {
    private readonly sessionStorage: BridgeSessionStorage;

    private session: BridgeSession | null = null;

    private bridge: BridgeGateway | null = null;

    private listeners: {
        eventsCallback: (e: ProviderEvent) => void;
        errorsCallback?: (e: ProviderError) => void;
    }[] = [];

    constructor(
        private readonly dappSettings: DappSettings,
        private readonly walletConnectionSource: WalletConnectionSource
    ) {
        this.sessionStorage = new BridgeSessionStorage(this.dappSettings.storage);
    }

    public async connect(): Promise<string> {
        const [pk, sk] = [Math.random().toString(), Math.random().toString()]; // generate keys;
        const sessionId = Math.random().toString();

        const sessionSeed: BridgeSessionSeed = {
            sessionId,
            keypair: { pk, sk },
            protocolVersion: this.dappSettings.protocolVersion,
            walletConnectionSource: this.walletConnectionSource
        };

        const bridge = new BridgeGateway(
            this.walletConnectionSource.bridgeLink,
            sessionId,
            (bridgeGateway, msg) => this.gatewayListener(sessionSeed, bridgeGateway, msg)
        );
        await bridge.registerSession();

        return this.generateUniversalLink(sessionSeed);
    }

    public sendRequest<T extends RequestType>(
        request: ActionRequest<T>
    ): Promise<ActionResponse<T>> {
        return Promise.resolve(request as unknown as ActionResponse<T>);
    }

    public disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    public listen(
        eventsCallback: (e: ProviderEvent) => void,
        errorsCallback?: (e: ProviderError) => void
    ): void {
        this.listeners.push({ eventsCallback, errorsCallback });
    }

    private async gatewayListener(
        sessionSeed: BridgeSessionSeed,
        bridge: BridgeGateway,
        msg: BridgeMessage
    ): Promise<void> {
        if ('event' in msg && msg.event.name === 'connect') {
            await this.onWalletConnected(sessionSeed, bridge, msg.event);
        }

        this.listeners.forEach(listener => {
            if ('event' in msg) {
                listener.eventsCallback(this.parseBridgeEvent(msg.event));
                return;
            }

            listener.errorsCallback?.(this.parseBridgeError(msg.error));
        });
    }

    private async onWalletConnected(
        sessionSeed: BridgeSessionSeed,
        bridge: BridgeGateway,
        e: BridgeEventConnect
    ): Promise<void> {
        const session: BridgeSession = {
            ...sessionSeed,
            walletPk: e.value.walletPk
        };
        await this.sessionStorage.storeSession(session);

        this.session = session;
        this.bridge = bridge;
    }

    private parseBridgeEvent(e: BridgeEvent): ProviderEvent {
        return e as ProviderEvent;
    }

    private parseBridgeError(e: BridgeError): ProviderError {
        return e as ProviderError;
    }

    private generateUniversalLink(sessionSeed: BridgeSessionSeed): string {
        const url = new URL(this.walletConnectionSource.universalLinkBase);
        url.searchParams.append('sessionId', sessionSeed.sessionId);
        url.searchParams.append('pk', sessionSeed.keypair.pk);
        url.searchParams.append('metadata', JSON.stringify(this.dappSettings.metadata));
        url.searchParams.append('version', this.dappSettings.protocolVersion);
        return url.toString();
    }
}

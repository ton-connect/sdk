import {
    AppRequest,
    ConnectEvent,
    ConnectRequest,
    DeviceInfo,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@tonconnect/protocol';
import { WalletInfoDTO } from 'src/models/wallet/wallet-info';
import { hasProperties, hasProperty, OptionalTraceable } from 'src/utils/types';

export interface InjectedWalletApi {
    deviceInfo: DeviceInfo;
    walletInfo: Pick<
        WalletInfoDTO,
        'name' | 'app_name' | 'tondns' | 'image' | 'about_url' | 'platforms' | 'features'
    >;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(
        protocolVersion: number,
        message: ConnectRequest,
        options?: OptionalTraceable
    ): Promise<OptionalTraceable<ConnectEvent>>;
    restoreConnection(options?: OptionalTraceable): Promise<OptionalTraceable<ConnectEvent>>;
    send<T extends RpcMethod>(
        message: AppRequest<T>,
        options?: OptionalTraceable
    ): Promise<WalletResponse<T>>;
    listen(callback: (event: OptionalTraceable<WalletEvent>) => void): () => void;

    /**
     * @deprecated
     */
    disconnect(): void;
}

export function isJSBridgeWithMetadata(value: unknown): value is { tonconnect: InjectedWalletApi } {
    try {
        if (!hasProperty(value, 'tonconnect') || !hasProperty(value.tonconnect, 'walletInfo')) {
            return false;
        }

        return hasProperties(value.tonconnect.walletInfo, [
            'name',
            'app_name',
            'image',
            'about_url',
            'platforms'
        ]);
    } catch {
        return false;
    }
}

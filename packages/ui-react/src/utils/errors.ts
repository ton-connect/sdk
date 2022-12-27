import { TonConnectUI } from '@tonconnect/ui';
import { TonConnectProviderNotSetError } from '../errors/ton-connect-provider-not-set.error';

export function checkProvider(provider: TonConnectUI | null): provider is TonConnectUI {
    if (!provider) {
        throw new TonConnectProviderNotSetError(
            'You should add <TonConnectUIProvider> on the top of the app to use TonConnect'
        );
    }

    return true;
}

import { TonConnectUi } from '@tonconnect/ui';
import { TonConnectProviderNotSetError } from '../errors/ton-connect-provider-not-set.error';

export function checkProvider(provider: TonConnectUi | null): provider is TonConnectUi {
    if (!provider) {
        throw new TonConnectProviderNotSetError(
            'You should add <TonConnectUIProvider> on the top of the app to use TonConnect'
        );
    }

    return true;
}

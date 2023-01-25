import { createMemo, createResource, useContext } from 'solid-js';
import { applyWalletsListConfiguration } from 'src/app/utils/wallets';
import { appState } from 'src/app/state/app.state';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { Accessor } from 'solid-js/types/reactive/signal';
import { WalletInfo } from '@tonconnect/sdk';

export function useWalletsList(excludeInjectableOnly = false): Accessor<WalletInfo[] | null> {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [fetchedWalletsList] = createResource(() => tonConnectUI!.getWallets());

    return createMemo(() => {
        if (fetchedWalletsList.state !== 'ready') {
            return null;
        }

        return applyWalletsListConfiguration(
            fetchedWalletsList().filter(wallet => !excludeInjectableOnly || 'bridgeUrl' in wallet),
            appState.walletsList
        );
    });
}

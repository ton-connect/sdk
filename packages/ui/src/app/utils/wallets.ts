import { WalletInfo, TonConnect } from '@tonconnect/sdk';
import { UIWallet } from 'src/models/ui-wallet';
import { WalletsListConfiguration } from 'src/models';
import { notLikeNull } from 'src/app/utils/types';
import { mergeConcat, uniq } from 'src/app/utils/array';

export function uiWalletToWalletInfo(uiWallet: UIWallet): WalletInfo {
    if ('jsBridgeKey' in uiWallet) {
        return {
            ...uiWallet,
            injected: TonConnect.isWalletInjected(uiWallet.jsBridgeKey),
            embedded: TonConnect.isInsideWalletBrowser(uiWallet.jsBridgeKey)
        };
    }

    return uiWallet;
}

export function applyWalletsListConfiguration(
    walletsList: WalletInfo[],
    configuration?: WalletsListConfiguration
): WalletInfo[] {
    if (!configuration) {
        return walletsList;
    }

    if (configuration.includeWallets?.length) {
        walletsList = mergeConcat(
            'name',
            walletsList,
            configuration.includeWallets.map(uiWalletToWalletInfo)
        );
    }

    if (configuration.walletsOrder?.length) {
        const notMentionedWallets = walletsList.filter(
            wallet => !configuration.walletsOrder!.includes(wallet.name)
        );

        walletsList = uniq(configuration.walletsOrder)
            .map(walletName => walletsList.find(wallet => wallet.name === walletName))
            .filter(notLikeNull)
            .concat(notMentionedWallets);
    }

    return walletsList;
}

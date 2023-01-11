import { WalletInfo, TonConnect } from '@tonconnect/sdk';
import { UIWallet } from 'src/models/ui-wallet';
import { WalletsListConfiguration } from 'src/models';

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

    if ('wallets' in configuration) {
        return configuration.wallets
            .map(wallet => {
                if (typeof wallet === 'string') {
                    const walletInfo = walletsList.find(item => item.name === wallet);

                    if (!walletInfo) {
                        console.error(
                            `Wallet with name === '${wallet}' wasn't found in the wallets list. Check '${wallet}' correctness. Available wallets names: ${walletsList
                                .map(i => "'" + i.name + "'")
                                .join(', ')}`
                        );

                        return null;
                    }
                    return walletInfo;
                }

                return uiWalletToWalletInfo(wallet);
            })
            .filter(i => !!i) as WalletInfo[];
    }

    const filteredWalletsList = configuration.excludeWallets?.length
        ? walletsList.filter(wallet =>
              configuration.excludeWallets?.every(item => item !== wallet.name)
          )
        : walletsList;

    if (!configuration.includeWallets) {
        return filteredWalletsList;
    }

    if (configuration.includeWalletsOrder === 'start') {
        return configuration.includeWallets.map(uiWalletToWalletInfo).concat(walletsList);
    }

    return walletsList.concat(configuration.includeWallets.map(uiWalletToWalletInfo));
}

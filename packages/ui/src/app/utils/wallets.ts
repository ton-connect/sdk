import { WalletInfo, TonConnect } from '@tonconnect/sdk';
import { UIWallet } from 'src/models/ui-wallet';
import { WalletsListConfiguration } from 'src/models';
import { mergeConcat } from 'src/app/utils/array';
import { ECOSYSTEM_WALLETS } from 'src/app/env/ECOSYSTEM_WALLETS';

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
        return arrangeWallets(walletsList);
    }

    if (configuration.includeWallets?.length) {
        walletsList = mergeConcat(
            'name',
            walletsList,
            configuration.includeWallets.map(uiWalletToWalletInfo)
        );
    }

    return arrangeWallets(walletsList, configuration.featuredWallet);
}

function arrangeWallets(walletsList: WalletInfo[], featuredWallet?: string): WalletInfo[] {
    const ecosystemWallets = walletsList.filter(wallet =>
        ECOSYSTEM_WALLETS.includes(wallet.appName)
    );

    const featuredWalletInfo =
        featuredWallet && !ECOSYSTEM_WALLETS.includes(featuredWallet)
            ? walletsList.find(wallet => wallet.appName === featuredWallet)
            : undefined;

    const remainingWallets = walletsList.filter(
        wallet => !ECOSYSTEM_WALLETS.includes(wallet.appName) && wallet.appName !== featuredWallet
    );

    return [
        ...ecosystemWallets,
        ...(featuredWalletInfo ? [featuredWalletInfo] : []),
        ...remainingWallets
    ];
}

export function supportsDesktop(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['macos', 'linux', 'windows'].includes(w));
}

export function supportsMobile(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['ios', 'android'].includes(w));
}

export function supportsExtension(walletInfo: WalletInfo): boolean {
    return walletInfo.platforms.some(w => ['chrome', 'firefox', 'safari'].includes(w));
}

export function eqWalletName(wallet1: { name: string; appName: string }, name?: string): boolean {
    if (!name) {
        return false;
    }

    return (
        wallet1.name.toLowerCase() === name.toLowerCase() ||
        wallet1.appName.toLowerCase() === name.toLowerCase()
    );
}

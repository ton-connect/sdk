import { FetchWalletsError } from 'src/errors/wallets-manager/fetch-wallets.error';
import {
    WalletInfoRemote,
    WalletInfoInjected,
    WalletInfo,
    WalletInfoDTO,
    isWalletInfoInjected
} from 'src/models/wallet/wallet-info';
import { InjectedProvider } from 'src/provider/injected/injected-provider';

export class WalletsListManager {
    private walletsListCache: Promise<WalletInfo[]> | null = null;

    private readonly walletsListSource =
        'https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json';

    public async getWallets(): Promise<WalletInfo[]> {
        if (!this.walletsListCache) {
            this.walletsListCache = this.fetchWalletsList();
            this.walletsListCache.catch(() => (this.walletsListCache = null));
        }

        return this.walletsListCache;
    }

    public async getEmbeddedWallet(): Promise<WalletInfoInjected | null> {
        const walletsList = await this.getWallets();
        const injectedWallets = walletsList.filter(isWalletInfoInjected);

        if (injectedWallets.length !== 1) {
            return null;
        }

        return injectedWallets[0]!.embedded ? injectedWallets[0]! : null;
    }

    private async fetchWalletsList(): Promise<WalletInfo[]> {
        try {
            const walletsResponse = await fetch(this.walletsListSource);
            const walletsList: WalletInfoDTO[] = await walletsResponse.json();

            if (
                !Array.isArray(walletsList) ||
                !walletsList.every(wallet => this.isCorrectWalletConfigDTO(wallet))
            ) {
                throw new FetchWalletsError('Wrong wallets list format');
            }

            return this.walletConfigDTOListToWalletConfigList(walletsList);
        } catch (e) {
            throw new FetchWalletsError(e);
        }
    }

    private walletConfigDTOListToWalletConfigList(walletConfigDTO: WalletInfoDTO[]): WalletInfo[] {
        return walletConfigDTO.map(walletConfigDTO => {
            const walletConfig: WalletInfo = {
                name: walletConfigDTO.name,
                imageUrl: walletConfigDTO.image,
                aboutUrl: walletConfigDTO.about_url,
                tondns: walletConfigDTO.tondns
            } as WalletInfo;

            walletConfigDTO.bridge.forEach(bridge => {
                if (bridge.type === 'sse') {
                    (walletConfig as WalletInfoRemote).bridgeUrl = bridge.url;
                    (walletConfig as WalletInfoRemote).universalLink =
                        walletConfigDTO.universal_url;
                    (walletConfig as WalletInfoRemote).deepLink = walletConfigDTO.deepLink;
                }

                if (bridge.type === 'js') {
                    const jsBridgeKey = bridge.key;
                    (walletConfig as WalletInfoInjected).jsBridgeKey = jsBridgeKey;
                    (walletConfig as WalletInfoInjected).injected =
                        InjectedProvider.isWalletInjected(jsBridgeKey);
                    (walletConfig as WalletInfoInjected).embedded =
                        InjectedProvider.isInsideWalletBrowser(jsBridgeKey);
                }
            });

            return walletConfig;
        });
    }

    private isCorrectWalletConfigDTO(value: unknown): value is WalletInfoDTO {
        if (!value || !(typeof value === 'object')) {
            return false;
        }

        const containsName = 'name' in value;
        const containsImage = 'image' in value;
        const containsAbout = 'about_url' in value;

        if (!containsName || !containsImage || !containsAbout) {
            return false;
        }

        if (
            !('bridge' in value) ||
            !Array.isArray((value as { bridge: unknown }).bridge) ||
            !(value as { bridge: unknown[] }).bridge.length
        ) {
            return false;
        }

        const bridge = (value as { bridge: unknown[] }).bridge;

        if (bridge.some(item => !item || typeof item !== 'object' || !('type' in item))) {
            return false;
        }

        const sseBridge = bridge.find(item => (item as { type: string }).type === 'sse');

        if (sseBridge) {
            if (
                !('url' in sseBridge) ||
                !(sseBridge as { url: string }).url ||
                !(value as { universal_url: string }).universal_url
            ) {
                return false;
            }
        }

        const jsBridge = bridge.find(item => (item as { type: string }).type === 'js');

        if (jsBridge) {
            if (!('key' in jsBridge) || !(jsBridge as { key: string }).key) {
                return false;
            }
        }

        return true;
    }
}

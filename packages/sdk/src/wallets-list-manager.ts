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

        return injectedWallets[0]!;
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

            if ('bridge_url' in walletConfigDTO) {
                (walletConfig as WalletInfoRemote).bridgeUrl = walletConfigDTO.bridge_url;
                (walletConfig as WalletInfoRemote).universalLink = walletConfigDTO.universal_url;
            }

            if ('js_bridge_key' in walletConfigDTO) {
                const jsBridgeKey = walletConfigDTO.js_bridge_key;
                (walletConfig as WalletInfoInjected).jsBridgeKey = jsBridgeKey;
                (walletConfig as WalletInfoInjected).injected =
                    InjectedProvider.isWalletInjected(jsBridgeKey);
                (walletConfig as WalletInfoInjected).embedded =
                    InjectedProvider.isInsideWalletBrowser(jsBridgeKey);
            }

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

        const containsUniversalUrl = 'universal_url' in value;
        const containsHttpBridge = 'bridge_url' in value;
        const containsJsBridge = 'js_bridge_key' in value;

        return (containsHttpBridge && containsUniversalUrl) || containsJsBridge;
    }
}

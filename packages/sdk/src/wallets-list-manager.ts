import { FetchWalletsError } from 'src/errors/wallets-manager/fetch-wallets.error';
import {
    WalletInfoRemote,
    WalletInfoInjectable,
    WalletInfo,
    WalletInfoDTO,
    isWalletInfoCurrentlyEmbedded,
    WalletInfoCurrentlyEmbedded,
    WalletInfoCurrentlyInjected,
    WalletInfoBase
} from 'src/models/wallet/wallet-info';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { logError } from 'src/utils/log';
import { FALLBACK_WALLETS_LIST } from 'src/resources/fallback-wallets-list';

export class WalletsListManager {
    private walletsListCache: Promise<WalletInfo[]> | null = null;

    private walletsListCacheCreationTimestamp: number | null = null;

    private readonly cacheTTLMs: number | undefined;

    private readonly walletsListSource: string =
        'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets-v2.json';

    constructor(options?: { walletsListSource?: string; cacheTTLMs?: number }) {
        if (options?.walletsListSource) {
            this.walletsListSource = options.walletsListSource;
        }

        if (options?.cacheTTLMs) {
            this.cacheTTLMs = options.cacheTTLMs;
        }
    }

    public async getWallets(): Promise<WalletInfo[]> {
        if (
            this.cacheTTLMs &&
            this.walletsListCacheCreationTimestamp &&
            Date.now() > this.walletsListCacheCreationTimestamp + this.cacheTTLMs
        ) {
            this.walletsListCache = null;
        }

        if (!this.walletsListCache) {
            this.walletsListCache = this.fetchWalletsList();
            this.walletsListCache
                .then(() => {
                    this.walletsListCacheCreationTimestamp = Date.now();
                })
                .catch(() => {
                    this.walletsListCache = null;
                    this.walletsListCacheCreationTimestamp = null;
                });
        }

        return this.walletsListCache;
    }

    public async getEmbeddedWallet(): Promise<WalletInfoCurrentlyEmbedded | null> {
        const walletsList = await this.getWallets();
        const embeddedWallets = walletsList.filter(isWalletInfoCurrentlyEmbedded);
        return embeddedWallets.length === 1 ? embeddedWallets[0]! : null;
    }

    private async fetchWalletsList(): Promise<WalletInfo[]> {
        let walletsList: WalletInfoDTO[] = [];

        try {
            const walletsResponse = await fetch(this.walletsListSource);
            walletsList = await walletsResponse.json();

            if (!Array.isArray(walletsList)) {
                throw new FetchWalletsError(
                    'Wrong wallets list format, wallets list must be an array.'
                );
            }

            const wrongFormatWallets = walletsList.filter(
                wallet => !this.isCorrectWalletConfigDTO(wallet)
            );
            if (wrongFormatWallets.length) {
                logError(
                    `Wallet(s) ${wrongFormatWallets
                        .map(wallet => (wallet as WalletInfoDTO)?.name || 'unknown')
                        .join(
                            ', '
                        )} config format is wrong. They were removed from the wallets list.`
                );

                walletsList = walletsList.filter(wallet => this.isCorrectWalletConfigDTO(wallet));
            }
        } catch (e) {
            logError(e);
            walletsList = FALLBACK_WALLETS_LIST;
        }

        let currentlyInjectedWallets: WalletInfoCurrentlyInjected[] = [];
        try {
            currentlyInjectedWallets = InjectedProvider.getCurrentlyInjectedWallets();
        } catch (e) {
            logError(e);
        }

        return this.mergeWalletsLists(
            this.walletConfigDTOListToWalletConfigList(walletsList),
            currentlyInjectedWallets
        );
    }

    private walletConfigDTOListToWalletConfigList(walletConfigDTO: WalletInfoDTO[]): WalletInfo[] {
        return walletConfigDTO.map(walletConfigDTO => {
            const walletConfig: WalletInfoBase = {
                name: walletConfigDTO.name,
                appName: walletConfigDTO.app_name,
                imageUrl: walletConfigDTO.image,
                aboutUrl: walletConfigDTO.about_url,
                tondns: walletConfigDTO.tondns,
                platforms: walletConfigDTO.platforms
            };

            walletConfigDTO.bridge.forEach(bridge => {
                if (bridge.type === 'sse') {
                    (walletConfig as WalletInfoRemote).bridgeUrl = bridge.url;
                    (walletConfig as WalletInfoRemote).universalLink =
                        walletConfigDTO.universal_url!;
                    (walletConfig as WalletInfoRemote).deepLink = walletConfigDTO.deepLink;
                }
                if (bridge.type === 'js') {
                    const jsBridgeKey = bridge.key;
                    (walletConfig as WalletInfoInjectable).jsBridgeKey = jsBridgeKey;
                    (walletConfig as WalletInfoInjectable).injected =
                        InjectedProvider.isWalletInjected(jsBridgeKey);
                    (walletConfig as WalletInfoInjectable).embedded =
                        InjectedProvider.isInsideWalletBrowser(jsBridgeKey);
                }
            });
            return walletConfig as WalletInfo;
        });
    }

    private mergeWalletsLists(list1: WalletInfo[], list2: WalletInfo[]): WalletInfo[] {
        const names = new Set(list1.concat(list2).map(item => item.name));

        return [...names.values()].map(name => {
            const list1Item = list1.find(item => item.name === name);
            const list2Item = list2.find(item => item.name === name);

            return {
                ...(list1Item && { ...list1Item }),
                ...(list2Item && { ...list2Item })
            } as WalletInfo;
        });
    }

    // eslint-disable-next-line complexity
    private isCorrectWalletConfigDTO(value: unknown): value is WalletInfoDTO {
        if (!value || !(typeof value === 'object')) {
            return false;
        }

        const containsName = 'name' in value;
        const containsAppName = 'app_name' in value;
        const containsImage = 'image' in value;
        const containsAbout = 'about_url' in value;
        const containsPlatforms = 'platforms' in value;

        if (
            !containsName ||
            !containsImage ||
            !containsAbout ||
            !containsPlatforms ||
            !containsAppName
        ) {
            return false;
        }

        if (
            !(value as { platforms: unknown }).platforms ||
            !Array.isArray((value as { platforms: unknown }).platforms) ||
            !(value as { platforms: string[] }).platforms.length
        ) {
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
                !(sseBridge && typeof sseBridge === 'object' && 'url' in sseBridge) ||
                !(sseBridge as { url: string }).url ||
                !(value as unknown as { universal_url: string }).universal_url
            ) {
                return false;
            }
        }

        const jsBridge = bridge.find(item => (item as { type: string }).type === 'js');

        if (jsBridge) {
            if (
                typeof jsBridge !== 'object' ||
                !('key' in jsBridge) ||
                !(jsBridge as { key: string }).key
            ) {
                return false;
            }
        }

        return true;
    }
}

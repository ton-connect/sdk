import { FetchWalletsError } from 'src/errors/wallets-manager/fetch-wallets.error';
import {
    HTTPBridgeWalletConfig,
    JSBridgeWalletConfig,
    WalletConfig,
    WalletConfigDTO
} from 'src/models/wallet/wallet-config';
import { InjectedProvider } from 'src/provider/injected/injected-provider';

export class WalletsListManager {
    private walletsListCache: WalletConfig[] | null = null;

    private readonly walletsListSource =
        'https://raw.githubusercontent.com/ton-connect/wallets-list/main/wallets.json';

    public async getWalletsList(): Promise<WalletConfig[]> {
        if (this.walletsListCache) {
            return this.walletsListCache;
        }

        try {
            const walletsResponse = await fetch(this.walletsListSource);
            const walletsList: WalletConfigDTO[] = await walletsResponse.json();

            if (
                !Array.isArray(walletsList) ||
                !walletsList.every(wallet => this.isCorrectWalletConfigDTO(wallet))
            ) {
                throw new FetchWalletsError('Wrong wallets list format');
            }

            this.walletsListCache = this.walletConfigDTOListToWalletConfigList(walletsList);
            return this.walletsListCache;
        } catch (e) {
            throw new FetchWalletsError(e);
        }
    }

    public async getInjectedWalletsList(): Promise<JSBridgeWalletConfig[]> {
        const walletsList = (await this.getWalletsList()).filter(this.isInjectedWallet);
        return walletsList.filter(wallet => InjectedProvider.isWalletInjected(wallet.jsBridgeKey));
    }

    public async getRemoteConnectionWalletsList(): Promise<HTTPBridgeWalletConfig[]> {
        return (await this.getWalletsList()).filter(this.isRemoteConnectionWallet);
    }

    public async getWalletsConfig(): Promise<{
        allWalletsList: WalletConfig[];
        injectedWalletsList: JSBridgeWalletConfig[];
        remoteConnectionWalletsList: HTTPBridgeWalletConfig[];
    }> {
        const allWalletsList = await this.getWalletsList();
        const [injectedWalletsList, remoteConnectionWalletsList] = await Promise.all([
            this.getInjectedWalletsList(),
            this.getRemoteConnectionWalletsList()
        ]);

        return {
            allWalletsList,
            injectedWalletsList,
            remoteConnectionWalletsList
        };
    }

    private walletConfigDTOListToWalletConfigList(
        walletConfigDTO: WalletConfigDTO[]
    ): WalletConfig[] {
        return walletConfigDTO.map(walletConfigDTO => {
            const walletConfig: WalletConfig = {
                name: walletConfigDTO.name,
                imageUrl: walletConfigDTO.image,
                aboutUrl: walletConfigDTO.about_url,
                tondns: walletConfigDTO.tondns
            } as WalletConfig;

            if ('bridge_url' in walletConfigDTO) {
                (walletConfig as HTTPBridgeWalletConfig).bridgeUrl = walletConfigDTO.bridge_url;
                (walletConfig as HTTPBridgeWalletConfig).universalLinkBase =
                    walletConfigDTO.universal_url;
            }

            if ('js_bridge_key' in walletConfigDTO) {
                (walletConfig as JSBridgeWalletConfig).jsBridgeKey = walletConfigDTO.js_bridge_key;
            }

            return walletConfig;
        });
    }

    private isCorrectWalletConfigDTO(value: unknown): value is WalletConfigDTO {
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

        if (!(containsHttpBridge && containsUniversalUrl) && !containsJsBridge) {
            return false;
        }

        return true;
    }

    private isInjectedWallet(wallet: WalletConfig): wallet is JSBridgeWalletConfig {
        return 'jsBridgeKey' in wallet;
    }

    private isRemoteConnectionWallet(wallet: WalletConfig): wallet is HTTPBridgeWalletConfig {
        return 'bridgeUrl' in wallet;
    }
}

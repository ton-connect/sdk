import { WalletInfo } from 'src/ton-connect';
import { Provider } from 'src/ton-connect/core/provider/provider';

export interface Connection {
    walletInfo: WalletInfo;
    provider: Provider;
}

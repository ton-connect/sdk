import { WalletInfo } from 'src/models/wallet';
import { Provider } from 'src/provider/provider';

export interface Connection {
    walletInfo: WalletInfo;
    provider: Provider;
}

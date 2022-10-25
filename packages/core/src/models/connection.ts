import { Wallet } from 'src/models/wallet';
import { Provider } from 'src/provider/provider';

export interface Connection {
    walletInfo: Wallet;
    provider: Provider;
}

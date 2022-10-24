import {
    Account,
    SendTransactionRequest,
    SendTransactionResponse,
    WalletConnectionSource,
    WalletInfo
} from 'src/models';
import { DeviceInfo } from 'src/models/wallet/device-info';

export interface ITonConnect {
    connected: boolean;
    account: Account | null;
    walletAppInfo: DeviceInfo | null;
    onStatusChange(callback: (walletInfo: WalletInfo | null) => void): () => void;
    connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T
    ): Promise<T extends 'injected' ? void : string>;
    autoConnect(): Promise<void>;
    sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse>;
    // sign(signRequest: SignMessageRequest): Promise<SignMessageResponse>;
    disconnect(): Promise<void>;
}

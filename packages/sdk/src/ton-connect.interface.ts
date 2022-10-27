import { Account, WalletConnectionSource, Wallet } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';
import { ConnectAdditionalRequest } from 'src/models/methods/connect/connect-additional-request';

export interface ITonConnect {
    connected: boolean;
    account: Account | null;
    wallet: Wallet | null;
    onStatusChange(callback: (walletInfo: Wallet | null) => void): () => void;
    connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T,
        request?: ConnectAdditionalRequest
    ): T extends 'injected' ? void : string;
    autoConnect(): void;
    sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse>;
    disconnect(): Promise<void>;
    isInjectedProviderAvailable(): boolean;
}

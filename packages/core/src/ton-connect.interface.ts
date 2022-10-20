import {
    Account,
    SendTransactionRequest,
    SendTransactionResponse,
    SignMessageRequest,
    SignMessageResponse,
    WalletAppInfo,
    WalletConnectionSource,
    WalletInfo
} from 'src/models';

export interface ITonConnect {
    connected: boolean;
    account: Account | null;
    walletAppInfo: WalletAppInfo | null;
    onStatusChange(callback: (walletInfo: WalletInfo | null) => void): () => void;
    connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T
    ): Promise<T extends 'injected' ? void : string>;
    autoConnect(): Promise<void>;
    sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse>;
    sign(signRequest: SignMessageRequest): Promise<SignMessageResponse>;
    disconnect(): Promise<void>;
}

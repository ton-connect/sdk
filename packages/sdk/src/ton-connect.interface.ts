import { Account, WalletConnectionSource, Wallet } from 'src/models';
import { SendTransactionRequest, SendTransactionResponse } from 'src/models/methods';

export interface ITonConnect {
    connected: boolean;
    account: Account | null;
    wallet: Wallet | null;
    onStatusChange(callback: (walletInfo: Wallet | null) => void): () => void;
    connect<T extends WalletConnectionSource | 'injected'>(
        wallet: T
    ): T extends 'injected' ? void : string;
    autoConnect(): Promise<void>;
    sendTransaction(tx: SendTransactionRequest): Promise<SendTransactionResponse>;
    // sign(signRequest: SignMessageRequest): Promise<SignMessageResponse>;
    disconnect(): Promise<void>;
}

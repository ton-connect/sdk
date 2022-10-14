import { WalletInfo } from 'src/ton-connect/core';
import { Account } from 'src/ton-connect/core/models/wallet/account';
import { SendTransactionRequest } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-request';
import { SendTransactionResponse } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-response';
import { SignMessageRequest } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-request';
import { SignMessageResponse } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-response';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet/wallet-connection-source';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';

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

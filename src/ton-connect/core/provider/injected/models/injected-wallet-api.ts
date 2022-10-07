import { WalletInfo } from 'src/ton-connect';
import { Account } from 'src/ton-connect/core/models/account';
import { ActionRequest } from 'src/ton-connect/core/models/protocol/action-request';
import { ActionResponse } from 'src/ton-connect/core/models/protocol/action-response';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';

export interface InjectedWalletApi {
    getWalletAppInfo(): WalletAppInfo;

    connect(): Promise<WalletInfo>;
    sendRequest(request: ActionRequest): Promise<ActionResponse>;
    disconnect(): void;

    listen: {
        onAccountChange(callback: (account: Account) => void): void;
        onDisconnect(callback: () => void): void;
    };
}

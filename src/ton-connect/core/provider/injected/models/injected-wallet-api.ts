import { WalletInfo } from 'src/ton-connect';
import { Account } from 'src/ton-connect/core/models/account';
import {
    ActionRequest,
    RequestType
} from 'src/ton-connect/core/models/protocol/actions/action-request';
import { ActionResponse } from 'src/ton-connect/core/models/protocol/actions/action-response';
import { WalletAppInfo } from 'src/ton-connect/core/models/wallet/wallet-app-info';

export interface InjectedWalletApi {
    getWalletAppInfo(): WalletAppInfo;

    connect(): Promise<WalletInfo>;
    sendRequest<T extends RequestType>(request: ActionRequest<T>): Promise<ActionResponse<T>>;
    disconnect(): void;

    listen: {
        onAccountChange(callback: (account: Account) => void): void;
        onDisconnect(callback: () => void): void;
    };
}

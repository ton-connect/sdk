import { Account, WalletAppInfo, WalletInfo } from 'src/models';
import { ActionRequest, RequestType } from 'src/models/protocol/actions/action-request';
import { ActionResponse } from 'src/models/protocol/actions/action-response';

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

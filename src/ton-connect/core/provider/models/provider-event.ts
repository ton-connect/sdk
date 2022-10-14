import { WalletInfo } from 'src/ton-connect';
import { Account } from 'src/ton-connect/core/models/wallet/account';

export type ProviderEventConnect = {
    name: 'connect';
    value: WalletInfo;
};

export type ProviderEventAccountChange = {
    name: 'accountChange';
    value: {
        account: Account;
    };
};

export type ProviderEventDisconnect = {
    name: 'disconnect';
    value: {};
};

export type ProviderEvent =
    | ProviderEventConnect
    | ProviderEventAccountChange
    | ProviderEventDisconnect;

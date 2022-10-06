import { WalletInfo } from 'src/ton-connect';
import { Account } from 'src/ton-connect/core/models/account';

export type BridgeEventConnect = {
    name: 'connect';
    value: {
        walletInfo: WalletInfo;
        walletPk: string;
    };
};

export type BridgeEventAccountChange = {
    name: 'accountChange';
    value: {
        account: Account;
    };
};

export type BridgeEventDisconnect = {
    name: 'disconnect';
    value: {};
};

export type BridgeEvent = BridgeEventConnect | BridgeEventAccountChange | BridgeEventDisconnect;

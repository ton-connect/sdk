import { Account } from 'src/ton-connect/core/models/account';

export type BridgeEventConnect = {
    name: 'connect';
    value: {
        walletPubkey: string;
        account: Account;
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

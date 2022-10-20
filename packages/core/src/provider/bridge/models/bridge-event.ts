import { Account, WalletInfo } from 'src/models';

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

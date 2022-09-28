import { CHAIN } from 'src/ton-connect/core/models/CHAIN';

export interface WalletInfo {
    walletName: string;
    address: string;
    chain: CHAIN;
}

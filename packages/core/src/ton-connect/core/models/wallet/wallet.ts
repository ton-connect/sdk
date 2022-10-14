import { WalletInfo } from 'src/ton-connect';
import { WalletConnectionSource } from 'src/ton-connect/core/models/wallet/wallet-connection-source';

export type Wallet = WalletInfo & WalletConnectionSource;

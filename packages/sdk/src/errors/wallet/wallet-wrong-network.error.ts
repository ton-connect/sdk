import { TonConnectError } from 'src/errors/ton-connect.error';

export class WalletWrongNetworkError extends TonConnectError<{
    expectedChainId: string;
    actualChainId: string;
}> {}

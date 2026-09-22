import { ConnectEventError } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import {
    CONNECT_WALLET_ERRORS,
    walletResponseToError
} from 'src/errors/wallet-response/wallet-response-to-error';

class ConnectErrorsParser {
    parseError(error: ConnectEventError['payload']): TonConnectError {
        return walletResponseToError(error, CONNECT_WALLET_ERRORS);
    }
}

export const connectErrorsParser = new ConnectErrorsParser();

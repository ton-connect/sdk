import { UserRejectsError } from 'src/errors';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { UnknownError } from 'src/errors/unknown.error';
import { ConnectEventError } from '@ton-connect/protocol';

class ConnectErrorsParser {
    private readonly errorsCodes = {
        0: UnknownError,
        1: UserRejectsError
    };

    parseError(error: ConnectEventError['payload']): TonConnectError {
        const ErrorConstructor = this.errorsCodes[error.code] || UnknownError;
        return new ErrorConstructor(error.message);
    }
}

export const connectErrorsParser = new ConnectErrorsParser();

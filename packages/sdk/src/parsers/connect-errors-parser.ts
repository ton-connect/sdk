import { UserRejectsError } from 'src/errors';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { UnknownError } from 'src/errors/unknown.error';
import { CONNECT_EVENT_ERROR_CODES, ConnectEventError } from '@tonconnect/protocol';

class ConnectErrorsParser {
    private readonly errorsCodes: Partial<
        Record<CONNECT_EVENT_ERROR_CODES, typeof TonConnectError>
    > = {
        0: UnknownError,
        1: UserRejectsError
    };

    parseError(error: ConnectEventError['payload']): TonConnectError {
        let ErrorConstructor: typeof TonConnectError = UnknownError;

        if (error.code in this.errorsCodes) {
            ErrorConstructor = this.errorsCodes[error.code] || UnknownError;
        }

        return new ErrorConstructor(error.message);
    }
}

export const connectErrorsParser = new ConnectErrorsParser();

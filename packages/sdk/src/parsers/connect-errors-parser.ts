import { BadRequestError, UnknownAppError, UserRejectsError } from 'src/errors';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { UnknownError } from 'src/errors/unknown.error';
import { CONNECT_EVENT_ERROR_CODES, ConnectEventError } from '@tonconnect/protocol';

const connectEventErrorsCodes: Partial<Record<CONNECT_EVENT_ERROR_CODES, typeof TonConnectError>> =
    {
        [CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
        [CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
        [CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
        [CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError
    };

class ConnectErrorsParser {
    parseError(error: ConnectEventError['payload']): TonConnectError {
        let ErrorConstructor: typeof TonConnectError = UnknownError;

        if (error.code in connectEventErrorsCodes) {
            ErrorConstructor = connectEventErrorsCodes[error.code] || UnknownError;
        }

        return new ErrorConstructor(error.message);
    }
}

export const connectErrorsParser = new ConnectErrorsParser();

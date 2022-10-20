import { TonConnectError } from 'src/errors/ton-connect.error';
import { ActionError } from 'src/models/protocol/actions/action-error';

export class ErrorsParser {
    static parseAndThrowError(error: ActionError): never {
        switch (error.type) {
            case 'type1':
                throw new TonConnectError();
            default:
                throw new TonConnectError(error.message);
        }
    }
}

import { TonConnectError } from 'src/errors/ton-connect.error';

export class UserRejectsError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UserRejectsError.prototype);
    }
}

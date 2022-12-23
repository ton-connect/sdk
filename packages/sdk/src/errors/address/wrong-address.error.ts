import { TonConnectError } from 'src/errors';

export class WrongAddressError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, WrongAddressError.prototype);
    }
}

import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';

export class WrongAddressError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, WrongAddressError.prototype);
    }
}

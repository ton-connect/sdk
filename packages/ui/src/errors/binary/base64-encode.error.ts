import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';

export class Base64EncodeError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, Base64EncodeError.prototype);
    }
}

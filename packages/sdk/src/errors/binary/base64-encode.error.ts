import { TonConnectError } from 'src/errors';

export class Base64EncodeError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, Base64EncodeError.prototype);
    }
}

import { TonConnectError } from 'src/errors';

export class ParseHexError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, ParseHexError.prototype);
    }
}

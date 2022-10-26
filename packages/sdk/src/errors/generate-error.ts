import { TonConnectError } from 'src/errors/ton-connect.error';

export function generateError(ExtendsFrom = TonConnectError): typeof TonConnectError {
    return class extends ExtendsFrom {
        constructor(message?: string) {
            super(message);

            Object.setPrototypeOf(this, ExtendsFrom.prototype);
        }
    };
}

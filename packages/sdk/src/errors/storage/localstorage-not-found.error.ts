import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when `Storage` was not specified in the `DappMetadata` and default `localStorage` was not detected in the Node.js environment.
 */
export class LocalstorageNotFoundError extends TonConnectError {
    protected get info(): string {
        return 'Storage was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, LocalstorageNotFoundError.prototype);
    }
}

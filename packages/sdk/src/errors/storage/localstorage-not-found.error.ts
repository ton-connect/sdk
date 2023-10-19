import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * @deprecated will be removed in the next major release
 * Thrown when `Storage` was not specified in the `DappMetadata` and default `localStorage` was not detected in the environment.
 * TODO: is it used anywhere?
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

import { TonConnectError } from '@tonconnect/sdk';

/**
 * Base error class for all errors thrown by `TonConnectUI`.
 * Extends {@link TonConnectError} from `@tonconnect/sdk`.
 */
export class TonConnectUIError extends TonConnectError {
    /**
     * @param message - Human-readable description of the error.
     */
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectUIError.prototype);
    }
}

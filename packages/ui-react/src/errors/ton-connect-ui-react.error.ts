import { TonConnectUIError } from '@tonconnect/ui';

/**
 * Base class for every error thrown by `@tonconnect/ui-react`. Extends
 * `TonConnectUIError` from `@tonconnect/ui`, which itself extends
 * `TonConnectError` from `@tonconnect/sdk` — a single
 * `catch (e instanceof TonConnectError)` branch covers them all.
 */
export class TonConnectUIReactError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectUIReactError.prototype);
    }
}

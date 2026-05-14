import { TonConnectUIError } from '@tonconnect/ui';

/**
 * Base class for TonConnectUIReact errors. You can check if the error was triggered by the @tonconnect/ui-react using `err instanceof TonConnectUIReactError`.
 */
export class TonConnectUIReactError extends TonConnectUIError {
    /**
     * Construct a TonConnectUIReact error. Subclasses forward arguments
     * through `super(...args)`; consumers normally observe subclass
     * instances rather than constructing `TonConnectUIReactError` directly.
     * Arguments match the standard ES `Error` constructor.
     */
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectUIReactError.prototype);
    }
}

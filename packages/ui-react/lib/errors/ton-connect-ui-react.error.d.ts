import { TonConnectUIError } from '@tonconnect/ui';
/**
 * Base class for TonConnectUIReact errors. You can check if the error was triggered by the @tonconnect/ui-react using `err instanceof TonConnectUIReactError`.
 */
export declare class TonConnectUIReactError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>);
}

import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Unhanded unknown error.
 */
export class UnknownError extends TonConnectError {
    static readonly errorName: string = 'UnknownError';
}

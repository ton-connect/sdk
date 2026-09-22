import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';

export class WalletNotFoundError extends TonConnectUIError {
    static readonly errorName: string = 'WalletNotFoundError';

    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);
    }
}

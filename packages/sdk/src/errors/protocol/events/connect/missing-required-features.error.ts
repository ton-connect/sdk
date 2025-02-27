import { DeviceInfo } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when wallet can't get manifest by passed manifestUrl.
 */
export class MissingRequiredFeaturesError extends TonConnectError {
    declare cause: {
        device: DeviceInfo;
    };

    protected get info(): string {
        return 'Missing required features. You need to update your wallet.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, MissingRequiredFeaturesError.prototype);
    }
}

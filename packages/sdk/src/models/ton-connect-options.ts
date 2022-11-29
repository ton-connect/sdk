import { DappMetadata } from 'src/models/dapp/dapp-metadata';
import { IStorage } from 'src/storage/models/storage.interface';

/**
 * TonConnect constructor options
 */
export interface TonConnectOptions {
    /**
     * Dapp metadata that will be displayed in the user's wallet.
     * Options will be merged with the [defaults]{@link ./dapp/dappMetedata.ts} if there are some empty fields.
     */
    dappMetedata?: Partial<DappMetadata>;

    /**
     * Storage to save protocol data. For browser default is `localStorage`. If you use SDK with nodeJS, you have to specify this field.
     */
    storage?: IStorage;
}

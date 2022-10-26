import { DappMetadata } from 'src/models';
import { IStorage } from 'src/storage/models/storage.interface';

export interface DappSettings {
    metadata: DappMetadata;
    storage: IStorage;
}

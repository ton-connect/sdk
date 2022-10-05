import { DappMetadata } from 'src/ton-connect';
import { IStorage } from 'src/ton-connect/core/storage/models/storage.interface';

export interface DappSettings {
    metadata: DappMetadata;
    storage: IStorage;
    protocolVersion: string;
}

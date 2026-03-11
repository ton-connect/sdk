import { ConnectAdditionalRequest } from '../connect';

export interface DraftOptions {
    connectRequest?: ConnectAdditionalRequest;
    signal?: AbortSignal;
}

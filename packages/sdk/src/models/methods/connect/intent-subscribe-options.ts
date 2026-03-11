import type { ConnectAdditionalRequest } from './connect-additional-request';

export interface IntentSubscribeOptions {
    connectRequest?: ConnectAdditionalRequest;
    signal?: AbortSignal;
}

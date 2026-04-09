import { SignDataPayload } from '@tonconnect/protocol';

import { SendTransactionRequest } from './send-transaction';
import { SignMessageRequest } from './sign-message';

export * from './app-wire-request';
export * from './connect';
export * from './send-transaction';
export * from './sign-data';
export * from './sign-message';

export type AppRichRequest =
    | { method: 'sendTransaction'; request: SendTransactionRequest }
    | { method: 'signData'; request: SignDataPayload }
    | { method: 'signMessage'; request: SignMessageRequest };

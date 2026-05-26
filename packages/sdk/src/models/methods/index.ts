import { SignDataPayload } from '@tonconnect/protocol';

import { SendTransactionRequest } from './send-transaction';
import { SignMessageRequest } from './sign-message';

export * from './connect';
export * from './send-transaction';
export * from './sign-data';
export * from './sign-message';

/**
 * Method + payload pair the SDK can fold into the connect URL as an
 * [embedded request](https://docs.ton.org/applications/ton-connect/how-to/embedded-request) (`e` parameter).
 */
export type EmbeddedRequest =
    | { method: 'sendTransaction'; request: SendTransactionRequest }
    | { method: 'signData'; request: SignDataPayload }
    | { method: 'signMessage'; request: SignMessageRequest };

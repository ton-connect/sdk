import type { RawSendTransactionIntentRequest } from './send-transaction-intent';
import type { RawSignDataIntentRequest } from './sign-data-intent';
import type { RawSignMessageIntentRequest } from './sign-message-intent';
import type { RawSendActionIntentRequest } from './send-action-intent';

export type RawIntentRequest =
    | RawSendTransactionIntentRequest
    | RawSignDataIntentRequest
    | RawSignMessageIntentRequest
    | RawSendActionIntentRequest;

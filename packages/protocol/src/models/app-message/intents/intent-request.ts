import type { SendTransactionIntentRequest } from './send-transaction-intent';
import type { SignDataIntentRequest } from './sign-data-intent';
import type { SignMessageIntentRequest } from './sign-message-intent';
import type { SendActionIntentRequest } from './send-action-intent';

export type IntentRequest =
    | SendTransactionIntentRequest
    | SignDataIntentRequest
    | SignMessageIntentRequest
    | SendActionIntentRequest;

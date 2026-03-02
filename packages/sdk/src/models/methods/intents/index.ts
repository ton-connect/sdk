import {
    SendTransactionIntentResponse,
    SignDataIntentResponse,
    SignMessageIntentResponse
} from '..';

export type {
    SendTransactionIntentRequest,
    SendTransactionIntentItem,
    SendTransactionIntentItemTon,
    SendTransactionIntentItemJetton,
    SendTransactionIntentItemNft
} from './send-transaction-intent-request';
export type { SignDataIntentRequest } from './sign-data-intent-request';
export type { SignMessageIntentRequest } from './sign-message-intent-request';
export type { SendActionIntentRequest } from './send-action-intent-request';
export type { IntentUrlOptions, ConnectRequestForIntent } from './intent-url-options';

export type { SendTransactionResponse as SendTransactionIntentResponse } from '../send-transaction';
export type { SignDataResponse as SignDataIntentResponse } from '../sign-data';
export type { SignMessageResponse as SignMessageIntentResponse } from '../sign-message';
export type SendActionIntentResponse =
    | SendTransactionIntentResponse
    | SignDataIntentResponse
    | SignMessageIntentResponse;

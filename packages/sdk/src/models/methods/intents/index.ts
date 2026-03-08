import {
    SendActionIntentRequest,
    SendTransactionIntentRequest,
    SendTransactionIntentResponse,
    SignDataIntentRequest,
    SignDataIntentResponse,
    SignMessageIntentRequest,
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
export type { IntentOptions } from './intent-options';

export type { SendTransactionResponse as SendTransactionIntentResponse } from '../send-transaction';
export type { SignDataResponse as SignDataIntentResponse } from '../sign-data';
export type { SignMessageResponse as SignMessageIntentResponse } from '../sign-message';
export type SendActionIntentResponse =
    | SendTransactionIntentResponse
    | SignDataIntentResponse
    | SignMessageIntentResponse;

export type IntentRequest =
    | SendTransactionIntentRequest
    | SignDataIntentRequest
    | SignMessageIntentRequest
    | SendActionIntentRequest;

export type TypedSendTransactionIntentRequest = SendTransactionIntentRequest & {
    method: 'sendTransaction';
};
export type TypedSignDataIntentRequest = SignDataIntentRequest & { method: 'signData' };
export type TypedSignMessageIntentRequest = SignMessageIntentRequest & { method: 'signMessage' };
export type TypedSendActionIntentRequest = SendActionIntentRequest & { method: 'sendAction' };

export type TypedIntentRequest =
    | TypedSendTransactionIntentRequest
    | TypedSignDataIntentRequest
    | TypedSignMessageIntentRequest
    | TypedSendActionIntentRequest;

export type IntentResponse =
    | SendTransactionIntentResponse
    | SignDataIntentResponse
    | SignMessageIntentResponse
    | SendActionIntentResponse;

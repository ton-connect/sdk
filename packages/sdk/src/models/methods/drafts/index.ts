import {
    SendActionDraftRequest,
    SendTransactionDraftRequest,
    SendTransactionDraftResponse,
    SignDataDraftRequest,
    SignDataDraftResponse,
    SignMessageDraftRequest,
    SignMessageDraftResponse
} from '..';

export type {
    SendTransactionDraftRequest,
    SendTransactionDraftItem as SendTransactionDraftItem,
    SendTransactionDraftItemTon,
    SendTransactionDraftItemJetton,
    SendTransactionDraftItemNft
} from './send-transaction-draft-request';
export type { SignDataDraftRequest } from './sign-data-draft-request';
export type { SignMessageDraftRequest } from './sign-message-draft-request';
export type { SendActionDraftRequest } from './send-action-draft-request';
export type { DraftOptions } from './draft-options';

export type { SendTransactionResponse as SendTransactionDraftResponse } from '../send-transaction';
export type { SignDataResponse as SignDataDraftResponse } from '../sign-data';
export type { SignMessageResponse as SignMessageDraftResponse } from '../sign-message';
export type SendActionDraftResponse =
    | SendTransactionDraftResponse
    | SignDataDraftResponse
    | SignMessageDraftResponse;

export type DraftRequest =
    | SendTransactionDraftRequest
    | SignDataDraftRequest
    | SignMessageDraftRequest
    | SendActionDraftRequest;

export type TypedSendTransactionDraftRequest = SendTransactionDraftRequest & {
    method: 'sendTransaction';
};
export type TypedSignDataDraftRequest = SignDataDraftRequest & { method: 'signData' };
export type TypedSignMessageDraftRequest = SignMessageDraftRequest & { method: 'signMessage' };
export type TypedSendActionDraftRequest = SendActionDraftRequest & { method: 'sendAction' };

export type TypedDraftRequest =
    | TypedSendTransactionDraftRequest
    | TypedSignDataDraftRequest
    | TypedSignMessageDraftRequest
    | TypedSendActionDraftRequest;

export type DraftMethod = TypedDraftRequest['method'];
export type DraftResponses = {
    sendTransaction: SendTransactionDraftResponse;
    signData: SignDataDraftResponse;
    signMessage: SignMessageDraftResponse;
    sendAction: SendActionDraftResponse;
};

export type DraftResponse =
    | SendTransactionDraftResponse
    | SignDataDraftResponse
    | SignMessageDraftResponse
    | SendActionDraftResponse;

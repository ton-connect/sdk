import type { SendTransactionResponse } from '../send-transaction';
import type { SignDataResponse } from '../sign-data';
import type { SignMessageResponse } from '../sign-message';

export type { SendActionDraftRequest } from './send-action-draft-request';
export type { SendTransactionResponse, SignDataResponse, SignMessageResponse };

export type SendActionDraftResponse =
    | SendTransactionResponse
    | SignDataResponse
    | SignMessageResponse;

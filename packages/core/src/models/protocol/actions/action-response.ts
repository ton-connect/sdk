import { SendTransactionResponse, SignMessageResponse } from 'src/models';
import { ActionError } from 'src/models/protocol/actions/action-error';
import { RequestType } from 'src/models/protocol/actions/action-request';

export type ActionResponseSuccess<T extends RequestType> = T extends 'send-transaction'
    ? SendTransactionResponse
    : T extends 'sign-message'
    ? SignMessageResponse
    : never;

export type ActionResponse<T extends RequestType> =
    | {
          status: 'error';
          result: ActionError;
      }
    | {
          status: 'success';
          result: ActionResponseSuccess<T>;
      };

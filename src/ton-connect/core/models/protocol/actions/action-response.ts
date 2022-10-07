import { ActionError } from 'src/ton-connect/core/models/protocol/actions/action-error';
import { RequestType } from 'src/ton-connect/core/models/protocol/actions/action-request';

import { SendTransactionResponse } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-response';
import { SignMessageResponse } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-response';

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

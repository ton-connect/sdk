import { SendTransactionRequest } from 'src/ton-connect/core/models/protocol/actions/send-transaction/send-transaction-request';
import { SignMessageRequest } from 'src/ton-connect/core/models/protocol/actions/sign-message/sign-message-request';

export type RequestType = 'send-transaction' | 'sign-message';

export type ActionRequest<T extends RequestType> = T extends 'send-transaction'
    ? SendTransactionRequest
    : T extends 'sign-message'
    ? SignMessageRequest
    : never;

import { SendTransactionRequest, SignMessageRequest } from 'src/models';

export type RequestType = 'send-transaction' | 'sign-message';

export type ActionRequest<T extends RequestType> = T extends 'send-transaction'
    ? SendTransactionRequest
    : T extends 'sign-message'
    ? SignMessageRequest
    : never;

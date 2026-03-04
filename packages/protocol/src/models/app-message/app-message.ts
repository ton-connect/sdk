import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';
import {
    MakeSendTransactionIntentRequest,
    MakeSignDataIntentRequest,
    MakeSignMessageIntentRequest,
    MakeSendActionIntentRequest
} from './intent';

export type AppMessage =
    | ConnectRequest
    | AppRequest<keyof RpcRequests>
    | MakeSendTransactionIntentRequest
    | MakeSignDataIntentRequest
    | MakeSignMessageIntentRequest
    | MakeSendActionIntentRequest;

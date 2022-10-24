import { InitialRequest } from 'src/models/protocol/app-message/connect-request/connect-request';
import { AppRequest, RpcRequests } from 'src/models/protocol/app-message/request/app-request';

export type AppMessage = InitialRequest | AppRequest<keyof RpcRequests>;

import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';

export type AppMessage = ConnectRequest | AppRequest<keyof RpcRequests>;

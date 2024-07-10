import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';
export declare type AppMessage = ConnectRequest | AppRequest<keyof RpcRequests>;

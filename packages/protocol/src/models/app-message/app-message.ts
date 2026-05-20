import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';

/**
 * Anything a dApp can send to a wallet over the protocol.
 */
export type AppMessage = ConnectRequest | AppRequest<keyof RpcRequests>;

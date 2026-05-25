import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';

/**
 * Anything an app can send to a wallet over the bridge: the one-off
 * {@link ConnectRequest} that opens a session, or any JSON-RPC
 * {@link AppRequest} once the session is established.
 */
export type AppMessage = ConnectRequest | AppRequest<keyof RpcRequests>;

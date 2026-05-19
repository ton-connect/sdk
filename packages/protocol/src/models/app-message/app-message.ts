import { AppRequest, RpcRequests } from './request';
import { ConnectRequest } from './connect-request';

/**
 * Anything a dApp can send to a wallet over the protocol:
 *
 * - {@link ConnectRequest} — the unencrypted handshake carried in the
 *   connect URL.
 * - {@link AppRequest} — a JSON-RPC method invocation sent over the bridge.
 */
export type AppMessage = ConnectRequest | AppRequest<keyof RpcRequests>;

import type { SendTransactionRequest } from '../send-transaction';

/**
 * Payload for `ITonConnect.signMessage` / `TonConnectUI.signMessage`.
 *
 * Identical in shape to {@link SendTransactionRequest}.
 *
 * @see [Sign and relay a message (gasless) (docs)](https://docs.ton.org/applications/ton-connect/how-to/sign-message-gasless)
 * @see [`signMessage` (RPC spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md#signmessage)
 */
export type SignMessageRequest = SendTransactionRequest;

/**
 * The set of methods a dApp can invoke after a successful connect. Wallets
 * accept the methods they advertise via {@link Feature}.
 *
 * @see [RPC specification](https://github.com/ton-blockchain/ton-connect/blob/main/spec/rpc.md)
 */
export type RpcMethod = 'disconnect' | 'sendTransaction' | 'signData' | 'signMessage';

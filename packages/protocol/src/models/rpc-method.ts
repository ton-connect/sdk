/**
 * Names of the JSON-RPC methods an app can invoke on a connected wallet.
 * Used as the discriminator on {@link AppRequest} and {@link WalletResponse}.
 */
export type RpcMethod = 'disconnect' | 'sendTransaction' | 'signData' | 'signMessage';

/**
 *  from connect ton sdk
 * https://github.com/ton-connect/sdk/blob/main/packages/ui-react/src/errors/ton-connect-provider-not-set.error.ts
 */

import { TonConnectUIVueError } from "./ton-connect-ui-vue.error";

/**
 * Thrown when either <TonConnectProvider> not added to the top of the tags tree,
 * either there is an attempt using TonConnect UI hook or <TonConnectButton> inside <TonConnectProvider>
 */
export class TonConnectProviderNotSetError extends TonConnectUIVueError {
  constructor(...args: ConstructorParameters<typeof Error>) {
    super(...args);

    Object.setPrototypeOf(this, TonConnectProviderNotSetError.prototype);
  }
}

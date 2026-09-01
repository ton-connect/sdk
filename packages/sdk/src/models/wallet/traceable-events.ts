import { Traceable, WithoutIdDistributive } from 'src/utils/types';
import {
    RpcMethod,
    WalletEvent,
    WalletResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';

/**
 * `restored` marks a `connect` event that a provider replayed from stored state during
 * `restoreConnection()` rather than one the wallet just produced. The two are otherwise
 * identical, so without it a session restore is indistinguishable from a fresh connection.
 */
export type TraceableWalletEvent = WithoutIdDistributive<Traceable<WalletEvent>> & {
    restored?: boolean;
};
export type TraceableWalletResponse<T extends RpcMethod> = Traceable<
    WalletResponseSuccess<T> | WalletResponseError<T>
>;

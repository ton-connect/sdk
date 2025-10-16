import { Traceable, WithoutIdDistributive } from 'src/utils/types';
import {
    RpcMethod,
    WalletEvent,
    WalletResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';

export type TraceableWalletEvent = WithoutIdDistributive<Traceable<WalletEvent>>;
export type TraceableWalletResponse<T extends RpcMethod> = Traceable<
    WalletResponseSuccess<T> | WalletResponseError<T>
>;

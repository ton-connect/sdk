import {
    AppRequest,
    RpcMethod,
    WalletResponse,
    WalletResponseError,
    WalletResponseSuccess
} from '@tonconnect/protocol';
import { WithoutId } from 'src/utils/types';

export abstract class RpcParser<T extends RpcMethod> {
    abstract convertToRpcRequest(...args: unknown[]): WithoutId<AppRequest<T>>;

    abstract convertFromRpcResponse(rpcResponse: WithoutId<WalletResponseSuccess<T>>): unknown;

    abstract parseAndThrowError(response: WithoutId<WalletResponseError<T>>): never;

    public isError(
        response: WithoutId<WalletResponse<T>>
    ): response is WithoutId<WalletResponseError<T>> {
        return 'error' in response;
    }
}

import { AppRequest, RpcMethod, WalletResponse } from 'src/models';
import {
    WalletResponseError,
    WalletResponseSuccess
} from 'src/models/protocol/wallet-message/wallet-response/wallet-response';
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

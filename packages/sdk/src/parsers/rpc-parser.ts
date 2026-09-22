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

/** `id` of a wallet response, when the provider kept it. */
export function responseIdOf(response: object): string | undefined {
    const id = (response as { id?: unknown }).id;
    return id === undefined || id === null ? undefined : String(id);
}

/** A wallet answer shaped like a TON Connect response: an object carrying `result` or `error`. */
export function isWalletResponse(value: unknown): value is object {
    return typeof value === 'object' && value !== null && ('result' in value || 'error' in value);
}

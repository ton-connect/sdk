import { ConnectEvent, RpcMethod, WalletResponse } from '@tonconnect/protocol';
import { walletErrorPayloadFrom } from 'src/errors/wallet-response/wallet-error-payload';
import { validateConnectEventPayload } from 'src/validation/schemas';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * A wallet answer to a request, read as a TON Connect response: an object with
 * `result`, or with an `error` payload that has a readable code. The error
 * payload comes back normalized; anything else is `undefined`.
 */
export function walletResponseFrom<T extends RpcMethod>(
    value: unknown
): WalletResponse<T> | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    if ('error' in value) {
        const error = walletErrorPayloadFrom(value.error);
        return error ? ({ ...value, error } as unknown as WalletResponse<T>) : undefined;
    }
    return 'result' in value ? (value as unknown as WalletResponse<T>) : undefined;
}

/**
 * A wallet answer to `connect`, read as a TON Connect event: `connect` whose
 * payload passes {@link validateConnectEventPayload}, or `connect_error` with a
 * payload that has a readable code.
 * The error payload comes back normalized; anything else is `undefined`.
 */
export function connectEventFrom(value: unknown): ConnectEvent | undefined {
    if (!isRecord(value)) {
        return undefined;
    }
    if (value.event === 'connect') {
        return validateConnectEventPayload(value.payload) === null
            ? (value as unknown as ConnectEvent)
            : undefined;
    }
    if (value.event === 'connect_error') {
        const payload = walletErrorPayloadFrom(value.payload);
        return payload ? ({ ...value, payload } as unknown as ConnectEvent) : undefined;
    }
    return undefined;
}

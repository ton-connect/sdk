import { ConnectEvent, RpcMethod, WalletResponse } from '@tonconnect/protocol';
import { walletErrorPayloadFrom } from 'src/errors/wallet-response/wallet-error-payload';
import { validateConnectEventPayload } from 'src/validation/schemas';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

/**
 * A wallet answer to a request, read as a TON Connect response: an object with
 * a non-null `result`, or with an `error` payload that has a readable code.
 * The answer comes back as a copy read once, with the error payload normalized;
 * anything else, including an object whose reads throw, is `undefined`.
 */
export function walletResponseFrom<T extends RpcMethod>(
    value: unknown
): WalletResponse<T> | undefined {
    try {
        if (!isRecord(value)) {
            return undefined;
        }
        if ('error' in value) {
            const error = walletErrorPayloadFrom(value.error);
            return error ? ({ ...value, error } as unknown as WalletResponse<T>) : undefined;
        }
        if (!('result' in value)) {
            return undefined;
        }
        const result = value.result;
        return result === undefined || result === null
            ? undefined
            : ({ ...value, result } as unknown as WalletResponse<T>);
    } catch {
        return undefined;
    }
}

/**
 * A wallet answer to `connect`, read as a TON Connect event: `connect` whose
 * payload passes {@link validateConnectEventPayload}, or `connect_error` with a
 * payload that has a readable code.
 * The error payload comes back normalized; anything else, including an object
 * whose reads throw, is `undefined`.
 */
export function connectEventFrom(value: unknown): ConnectEvent | undefined {
    try {
        if (!isRecord(value)) {
            return undefined;
        }
        if (value.event === 'connect') {
            const payload = value.payload;
            return validateConnectEventPayload(payload) === null
                ? ({ ...value, payload } as unknown as ConnectEvent)
                : undefined;
        }
        if (value.event === 'connect_error') {
            const payload = walletErrorPayloadFrom(value.payload);
            return payload ? ({ ...value, payload } as unknown as ConnectEvent) : undefined;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

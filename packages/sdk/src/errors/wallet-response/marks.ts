import { TonConnectError } from 'src/errors/ton-connect.error';

// Marks travel on the wallet error payload object itself, so they survive the
// top-level spreads that add `traceId` to events and responses, and stay out
// of the payload's own keys and JSON form.
const normalizedPayloads = new WeakSet<object>();
const attachedErrors = new WeakMap<object, TonConnectError>();

/** Records that the payload was rebuilt from a wallet's rejection. */
export function markNormalized(payload: object): void {
    normalizedPayloads.add(payload);
}

export function isNormalized(payload: object): boolean {
    return normalizedPayloads.has(payload);
}

/** Makes the factory return `error` for this payload instead of mapping its code. */
export function attachError(payload: object, error: TonConnectError): void {
    attachedErrors.set(payload, error);
}

export function attachedErrorOf(payload: object): TonConnectError | undefined {
    return attachedErrors.get(payload);
}

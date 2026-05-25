/**
 * Shared envelope for every JSON-RPC wallet response — either the success or
 * error template. Method-specific response interfaces extend these to refine
 * the `result` shape and the `error.code` enum.
 */
export type WalletResponseTemplate = WalletResponseTemplateSuccess | WalletResponseTemplateError;

/** Success envelope: an opaque `result` string paired with the matching request `id`. */
export interface WalletResponseTemplateSuccess {
    /** Method-specific success payload, usually base64 or a JSON string. */
    result: string;
    /** Echoes the originating {@link AppRequest.id}. */
    id: string;
}

/** Error envelope: a structured `error` object paired with the matching request `id`. */
export interface WalletResponseTemplateError {
    /** Structured error. `code` is a method-specific enum; `data` is optional method-specific detail. */
    error: { code: number; message: string; data?: unknown };
    /** Echoes the originating {@link AppRequest.id}. */
    id: string;
}

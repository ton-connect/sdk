/** Hard cap — prevents huge JSON drafts from freezing the editor. */
export const BATCH_MESSAGE_COUNT_MAX = 1024;

/** Advertised `maxMessages` on TON Connect wallets (informational warning above this). */
export const BATCH_MESSAGE_COUNT_WALLET_HINT = 256;

export const isBatchMessageCountCommittable = (value: number): boolean =>
    Number.isFinite(value) && value >= 1 && value <= BATCH_MESSAGE_COUNT_MAX;

/**
 * Async key-value store used by the SDK to persist protocol state (session
 * keys, last connected wallet info, restoration markers).
 *
 * In the browser the SDK uses `window.localStorage` by default. In Node.js,
 * React Native or any other environment without a `localStorage` global the
 * dApp MUST pass a custom implementation on `TonConnectOptions.storage`.
 *
 * @example
 * ```ts
 * import type { IStorage } from '@tonconnect/sdk';
 *
 * const memoryStorage = {
 *     state: new Map<string, string>(),
 *     setItem(k, v) { this.state.set(k, v); return Promise.resolve(); },
 *     getItem(k)    { return Promise.resolve(this.state.get(k) ?? null); },
 *     removeItem(k) { this.state.delete(k); return Promise.resolve(); },
 * } satisfies IStorage & { state: Map<string, string> };
 * ```
 */
export interface IStorage {
    /**
     * Persist `value` under `key`. Overwrites any existing value.
     *
     * @param key — string identifier, scoped per dApp.
     * @param value — value to save.
     */
    setItem(key: string, value: string): Promise<void>;

    /**
     * Read the value previously stored under `key`, or `null` if absent.
     *
     * @param key — string identifier set on a previous {@link IStorage.setItem} call.
     */
    getItem(key: string): Promise<string | null>;

    /**
     * Delete the value stored under `key`. A no-op if the key does not exist.
     *
     * @param key — string identifier to remove.
     */
    removeItem(key: string): Promise<void>;
}

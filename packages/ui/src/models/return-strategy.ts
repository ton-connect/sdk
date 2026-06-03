/**
 * Where the wallet sends the user after they approve or decline a deep-link
 * request. Carried as the `ret` query parameter on the wallet's universal /
 * deep link.
 *
 * - `'back'` (default) — return to the originating app (browser, native
 *   host, etc.).
 * - `'none'` — wallet does not redirect; the user stays in the wallet.
 * - `` `${string}://${string}` `` — open the given URL. dApps should not
 *   pass their own webpage URL when running as a webpage; use this form for
 *   native-app callbacks or TMA `t.me/...` links.
 *
 * @see [Return strategy (deeplinks spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/deeplinks.md#return-strategy-ret)
 */
export type ReturnStrategy = 'back' | 'none' | `${string}://${string}`;

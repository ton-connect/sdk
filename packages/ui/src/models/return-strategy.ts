/**
 * Specifies return strategy for the deeplink when user signs/declines the request.
 * [See details]{@link https://github.com/ton-connect/docs/blob/main/bridge.md#universal-link}.
 */
export type ReturnStrategy = 'back' | 'none' | `${string}://${string}`;

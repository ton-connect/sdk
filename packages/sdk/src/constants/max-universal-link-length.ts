/**
 * Maximum length (in characters) of a universal link that can carry an embedded
 * request. Above this threshold the embedded request is dropped and a
 * connect-only link is used instead.
 *
 * Centralised here so the SDK (`BridgeProvider`), the UI layer
 * (`@tonconnect/ui`'s `openLink`) and the tests all reference a single source of
 * truth instead of re-declaring the number independently and drifting apart.
 */
export const MAX_UNIVERSAL_LINK_LENGTH = 1024;

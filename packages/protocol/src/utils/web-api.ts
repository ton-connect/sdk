/**
 * Detect whether the code is running under Node.js (as opposed to a browser
 * or a browser-like runtime). Useful for picking environment-specific
 * polyfills.
 */
export function isNode(): boolean {
    return (
        typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    );
}

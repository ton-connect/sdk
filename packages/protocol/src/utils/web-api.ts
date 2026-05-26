/**
 * `true` when running inside Node.js (detected via `process.versions.node`).
 */
export function isNode(): boolean {
    return (
        typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    );
}

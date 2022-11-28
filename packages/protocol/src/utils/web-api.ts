export function isNode(): boolean {
    return typeof require === 'function' && typeof global === 'object';
}

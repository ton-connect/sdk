/**
 * Shortens a long address-like string for compact display: keeps the first
 * `startPart` and last `endPart` characters, joined by an ellipsis. Strings
 * shorter than `startPart + endPart` are returned untouched.
 */
export const truncateAddress = (address: string, startPart = 5, endPart = 5): string =>
    address.length <= startPart + endPart
        ? address
        : `${address.slice(0, startPart)}…${address.slice(-endPart)}`;

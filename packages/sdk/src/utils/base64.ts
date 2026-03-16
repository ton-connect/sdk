export function normalizeBase64(data: string | undefined): string | undefined {
    if (typeof data !== 'string') return undefined;

    const paddedLength = data.length + ((4 - (data.length % 4)) % 4);
    return data.replace(/-/g, '+').replace(/_/g, '/').padEnd(paddedLength, '=');
}

/** Converts base64 to URL-safe base64 (base64url): + → -, / → _, strip trailing = */
export function toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

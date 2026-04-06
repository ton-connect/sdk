export function normalizeBase64(data: string | undefined): string | undefined {
    if (typeof data !== 'string') return undefined;

    const paddedLength = data.length + ((4 - (data.length % 4)) % 4);
    return data.replace(/-/g, '+').replace(/_/g, '/').padEnd(paddedLength, '=');
}

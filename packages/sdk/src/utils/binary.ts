export function base64ToBytes(base64Encoded: string): Uint8Array {
    return Uint8Array.from(atob(base64Encoded), c => c.charCodeAt(0));
}

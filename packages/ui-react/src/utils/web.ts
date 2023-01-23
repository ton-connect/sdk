export function isClientSide(): boolean {
    return typeof window !== 'undefined';
}

export function isServerSide(): boolean {
    return !isClientSide();
}

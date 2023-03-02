export function useDataAttributes<T extends object>(props: T): () => T {
    return (): T =>
        Object.fromEntries(Object.entries(props).filter(([key]) => key.startsWith('data-'))) as T;
}

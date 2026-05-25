export type RequestContextPatch = {
    from?: string;
    network?: string;
};

/** Merges optional `from` / `network` into a transaction or sign-data JSON object. */
export function mergeRequestContext<T extends object>(request: T, patch: RequestContextPatch): T {
    return {
        ...request,
        ...(patch.from !== undefined ? { from: patch.from } : {}),
        ...(patch.network !== undefined ? { network: patch.network } : {})
    };
}

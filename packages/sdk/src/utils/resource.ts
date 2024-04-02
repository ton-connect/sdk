import { createAbortController } from 'src/utils/defer';

/**
 * The resource interface.
 */
export type Resource<T, Args extends any[]> = {
    /**
     * Create a new resource.
     */
    create: (...args: Args) => Promise<T>;

    /**
     * Get the current resource.
     */
    current: () => T | null;

    /**
     * Dispose the current resource.
     */
    dispose: () => Promise<void>;

    /**
     * Recreate the current resource.
     */
    recreate: () => Promise<T>;
};

/**
 * Create a resource.
 *
 * @template T - The type of the resource.
 * @template Args - The type of the arguments for creating the resource.
 *
 * @param {(...args: Args) => Promise<T>} createFn - A function that creates the resource.
 * @param {(resource: T) => Promise<void>} [disposeFn] - An optional function that disposes the resource.
 */
export function createResource<T, Args extends any[]>(
    createFn: (signal: AbortSignal, ...args: Args) => Promise<T>,
    disposeFn: (resource: T) => Promise<void>
): Resource<T, Args> {
    let currentResource: T | null = null;
    let currentArgs: Args | null = null;
    let currentPromise: Promise<T> | null = null;
    let abortController: AbortController | null = null;

    // create a new resource
    const create = async (...args: Args): Promise<T> => {
        abortController?.abort();
        abortController = createAbortController();

        currentArgs = args;

        const promise = createFn(abortController.signal, ...args);
        currentPromise = promise;
        console.log('[resource.ts]: CREATING RESOURCE');
        const resource = await promise;
        console.log('[resource.ts]: RESOURCE CREATED');

        if (currentPromise !== promise) {
            await disposeFn(resource);
            throw new Error('Request was cancelled');
        }

        currentResource = resource;
        return currentResource;
    };

    // get the current resource
    const current = (): T | null => {
        return currentResource ?? null;
    };

    // dispose the current resource
    const dispose = async (): Promise<void> => {
        const resource = currentResource;
        currentResource = null;

        const promise = currentPromise;
        currentPromise = null;

        console.log('[resource.ts]: CALL ABORT CONTROLLER');
        abortController?.abort();

        await Promise.allSettled([
            resource ? disposeFn(resource) : Promise.resolve(),
            promise ? disposeFn(await promise) : Promise.resolve()
        ]);
    };

    // recreate the current resource
    const recreate = async (): Promise<T> => {
        await dispose();

        return create(...(currentArgs ?? ([] as unknown as Args)));
    };

    return {
        create,
        current,
        dispose,
        recreate
    };
}

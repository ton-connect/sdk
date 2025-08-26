import { useEffect, useRef, useState } from 'react';

export function useQuery<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    { deps = [] }: { deps?: unknown[] } = {}
): {
    loading: boolean;
    result: T | undefined;
    error: unknown;
    refetch: () => void;
    abort: () => void;
} {
    const [refetchCount, setRefetchCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [fnResult, setFnResult] = useState<T>();
    const [error, setError] = useState();
    const controllerRef = useRef<AbortController | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        const currentId = ++requestIdRef.current;
        setLoading(true);
        setError(undefined);

        fn(controller.signal)
            .then(result => {
                if (requestIdRef.current === currentId && !controller.signal.aborted) {
                    setFnResult(result);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (requestIdRef.current === currentId && !controller.signal.aborted) {
                    setLoading(false);
                    setError(err);
                }
            });

        return () => {
            controller.abort();
        };
    }, [...deps, refetchCount]);

    const refetch = () => setRefetchCount(count => count + 1);
    const abort = () => controllerRef.current?.abort();

    return {
        loading,
        result: fnResult,
        error,
        refetch,
        abort
    };
}

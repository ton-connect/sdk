import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const handle = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handle);
    }, [value, delay]);

    return debounced;
}

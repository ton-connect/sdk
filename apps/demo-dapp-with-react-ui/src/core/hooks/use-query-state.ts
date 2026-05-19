import { useEffect, useState } from 'react';

type Parser<T> = {
    parse: (value: string | null) => T;
    serialize: (value: T) => string;
};

function defaultParser<T>(): Parser<T> {
    return {
        parse: value => (value as T) ?? ('' as T),
        serialize: value => String(value)
    };
}

export function useQueryState<T = string>(
    key: string,
    parser: Parser<T> = defaultParser<T>() as Parser<T>
) {
    const getValueFromUrl = (): T => {
        const params = new URLSearchParams(window.location.search);
        return parser.parse(params.get(key));
    };

    const [state, setState] = useState<T>(getValueFromUrl);

    useEffect(() => {
        const onPopState = () => {
            setState(getValueFromUrl());
        };

        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const setQueryState = (value: T) => {
        const params = new URLSearchParams(window.location.search);

        if (value === null || value === undefined || value === '') {
            params.delete(key);
        } else {
            params.set(key, parser.serialize(value));
        }

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState(null, '', newUrl);

        setState(value);
    };

    return [state, setQueryState] as const;
}

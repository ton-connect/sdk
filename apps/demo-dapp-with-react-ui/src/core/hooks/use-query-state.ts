import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

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
    const [searchParams, setSearchParams] = useSearchParams();

    const state = parser.parse(searchParams.get(key));

    const setQueryState = useCallback(
        (value: T) => {
            setSearchParams(
                prev => {
                    const next = new URLSearchParams(prev);

                    if (value === null || value === undefined || value === '') {
                        next.delete(key);
                    } else {
                        next.set(key, parser.serialize(value));
                    }

                    return next;
                },
                { replace: true }
            );
        },
        [key, parser, setSearchParams]
    );

    return [state, setQueryState] as const;
}

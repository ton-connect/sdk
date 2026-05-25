import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Appends the current URL search string to a pathname (keeps TonConnect settings across routes). */
export function usePreserveSearch() {
    const [searchParams] = useSearchParams();

    const withSearch = useCallback(
        (pathname: string) => {
            const search = searchParams.toString();
            return search ? `${pathname}?${search}` : pathname;
        },
        [searchParams]
    );

    return withSearch;
}

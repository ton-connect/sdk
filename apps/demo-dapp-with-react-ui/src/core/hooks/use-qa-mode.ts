import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { isQaModeEnabledViaUrl } from '../utils/qa-mode-from-url';

/** Reactive `?qa=1` flag — preserved across SPA routes via search params. */
export function useQaMode(): boolean {
    const [searchParams] = useSearchParams();

    return useMemo(() => {
        const query = searchParams.toString();
        return isQaModeEnabledViaUrl(query ? `?${query}` : undefined);
    }, [searchParams]);
}

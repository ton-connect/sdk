import { useEffect, useState } from 'react';

import {
    TRANSACTION_VALID_UNTIL_MAX_HOURS,
    TRANSACTION_VALID_UNTIL_MAX_SECONDS
} from '../../../../../core/utils/validation';

export type TimerStatus = 'ok' | 'warning' | 'expired' | 'missing' | 'tooFar';

export interface TimerState {
    display: string;
    status: TimerStatus;
}

const WARNING_THRESHOLD_SEC = 300;

const formatCountdown = (diff: number): string => {
    if (!Number.isFinite(diff)) {
        return '—';
    }

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

/**
 * Drives a 1s-tick countdown towards `validUntil` (a unix timestamp in seconds).
 * Owns the interval lifecycle and the status policy:
 *  - `> 5m` left and within max window → ok (green)
 *  - `0 < diff <= 5m` left → warning (yellow)
 *  - more than max window ahead → tooFar (yellow, display `> 48h`)
 *  - past `validUntil` → expired (red, display shows negative countdown).
 */
export const useValidUntilTimer = (validUntil: number | undefined): TimerState => {
    const [state, setState] = useState<TimerState>({ display: '—', status: 'missing' });

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let cancelled = false;

        const tick = () => {
            if (validUntil === undefined || !Number.isFinite(validUntil)) {
                setState({ display: '—', status: 'missing' });
                if (cancelled) return;
                timeoutId = setTimeout(tick, 1000);
                return;
            }

            const diff = validUntil - Math.floor(Date.now() / 1000);
            if (diff <= 0) {
                setState({ display: `−${formatCountdown(-diff)}`, status: 'expired' });
            } else if (diff > TRANSACTION_VALID_UNTIL_MAX_SECONDS) {
                setState({
                    display: `> ${TRANSACTION_VALID_UNTIL_MAX_HOURS}h`,
                    status: 'tooFar'
                });
            } else {
                const status: TimerStatus = diff <= WARNING_THRESHOLD_SEC ? 'warning' : 'ok';
                setState({ display: formatCountdown(diff), status });
            }
            if (cancelled) return;
            timeoutId = setTimeout(tick, 1000);
        };

        tick();
        return () => {
            cancelled = true;
            if (timeoutId !== undefined) clearTimeout(timeoutId);
        };
    }, [validUntil]);

    return state;
};

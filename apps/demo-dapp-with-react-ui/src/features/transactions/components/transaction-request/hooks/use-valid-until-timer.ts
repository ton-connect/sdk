import { useEffect, useState } from 'react';

export type TimerStatus = 'ok' | 'warning' | 'expired';

export interface TimerState {
    display: string;
    status: TimerStatus;
}

const WARNING_THRESHOLD_SEC = 300;

const formatCountdown = (diff: number): string => {
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
 *  - `> 5m` left → ok (green)
 *  - `0 < diff <= 5m` left → warning (yellow)
 *  - past `validUntil` → expired (red, display shows negative countdown).
 */
export const useValidUntilTimer = (validUntil: number): TimerState => {
    const [state, setState] = useState<TimerState>({ display: '', status: 'ok' });

    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        let cancelled = false;

        const tick = () => {
            const diff = validUntil - Math.floor(Date.now() / 1000);
            if (diff <= 0) {
                setState({ display: `−${formatCountdown(-diff)}`, status: 'expired' });
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

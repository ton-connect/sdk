import { useEffect, useState } from 'react';

import { formatCountdown } from '../utils';

export type TimerStatus = 'ok' | 'warning' | 'expired';

export interface TimerState {
    display: string;
    status: TimerStatus;
}

const WARNING_THRESHOLD_SEC = 300;

/**
 * Drives a 1s-tick countdown towards `validUntil` (a unix timestamp in seconds).
 * Owns the interval lifecycle and the status policy:
 *  - `> 5m` left → ok (green)
 *  - `0 < diff <= 5m` left → warning (yellow)
 *  - past `validUntil` → expired (red, display shows negative countdown).
 */
export function useValidUntilTimer(validUntil: number): TimerState {
    const [state, setState] = useState<TimerState>({ display: '', status: 'ok' });

    useEffect(() => {
        const update = () => {
            const diff = validUntil - Math.floor(Date.now() / 1000);
            if (diff <= 0) {
                setState({ display: `−${formatCountdown(-diff)}`, status: 'expired' });
                return;
            }
            const status: TimerStatus = diff <= WARNING_THRESHOLD_SEC ? 'warning' : 'ok';
            setState({ display: formatCountdown(diff), status });
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [validUntil]);

    return state;
}

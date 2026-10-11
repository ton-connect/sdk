import { logDebug } from 'src/app/utils/log';

const WARM_UP_DURATION = 1000;
const WINDOW_DURATION = 2000;
// Below 20 frames per second
const MAX_MEDIAN_FRAME_INTERVAL = 50;
// A longer gap is a pause the renderer was not told about, such as a hidden window
const MAX_FRAME_INTERVAL = 1000;

// Once the device cannot keep up, every 3D diamond gives way to its still image until a reload
let isDegraded = false;
const degradationListeners = new Set<() => void>();

export function getIsDiamond3dDegraded(): boolean {
    return isDegraded;
}

export function onDiamond3dDegraded(listener: () => void): () => void {
    degradationListeners.add(listener);

    return () => {
        degradationListeners.delete(listener);
    };
}

export function markDiamond3dDegraded(reason: string): void {
    if (isDegraded) {
        return;
    }

    logDebug(`Diamond falls back to its still image: ${reason}`);

    isDegraded = true;
    degradationListeners.forEach(listener => listener());
}

// Frame intervals grow when the GPU or the main thread cannot keep up, whatever the cause
export function createFrameWatchdog(): { track: (now: number) => void; reset: () => void } {
    let lastTime: number | undefined;
    let windowStart = 0;
    let intervals: number[] = [];

    function reset(): void {
        lastTime = undefined;
        intervals = [];
    }

    function track(now: number): void {
        if (lastTime === undefined || now - lastTime > MAX_FRAME_INTERVAL) {
            lastTime = now;
            windowStart = now + WARM_UP_DURATION;
            intervals = [];
            return;
        }

        const interval = now - lastTime;
        lastTime = now;

        if (now < windowStart) {
            return;
        }

        intervals.push(interval);

        if (now - windowStart < WINDOW_DURATION) {
            return;
        }

        const median = getMedian(intervals);
        intervals = [];
        windowStart = now;

        if (median > MAX_MEDIAN_FRAME_INTERVAL) {
            markDiamond3dDegraded(`median frame interval ${Math.round(median)} ms`);
        }
    }

    return { track, reset };
}

function getMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);

    return sorted[Math.floor(sorted.length / 2)]!;
}

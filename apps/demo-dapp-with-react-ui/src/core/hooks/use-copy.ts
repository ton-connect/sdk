import { useCallback, useRef, useState } from 'react';

const COPIED_RESET_MS = 2000;

/**
 * Copy text to the clipboard with a transient `copied` flag that resets after
 * {@link COPIED_RESET_MS} milliseconds. Returns the flag and a stable trigger.
 */
export const useCopy = (text: string): [boolean, () => void] => {
    const [copied, setCopied] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const copy = useCallback(() => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
        });
    }, [text]);

    return [copied, copy];
};

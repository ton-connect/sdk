import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';

const formatDraft = (value: number | undefined): string =>
    value === undefined ? '' : String(value);

export type UseIntegerInputDraftOptions = {
    /**
     * When the user clears the field, notify the parent with `undefined`.
     * Otherwise only the local draft is cleared until blur or a valid commit.
     */
    commitUndefinedWhenEmpty?: boolean;
    /** Return false to keep typing locally without calling `onCommit` yet. */
    shouldCommit?: (value: number) => boolean;
};

/**
 * String-backed integer input: allows empty/partial values while typing;
 * does not force-clamp on every keystroke (use validation on submit instead).
 */
export function useIntegerInputDraft(
    value: number | undefined,
    onCommit: (next: number | undefined) => void,
    options: UseIntegerInputDraftOptions = {}
) {
    const { commitUndefinedWhenEmpty = false, shouldCommit = () => true } = options;
    const [draft, setDraft] = useState(() => formatDraft(value));

    useEffect(() => {
        setDraft(formatDraft(value));
    }, [value]);

    const onChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const raw = event.target.value;
            if (raw === '') {
                setDraft('');
                if (commitUndefinedWhenEmpty) {
                    onCommit(undefined);
                }
                return;
            }
            if (!/^\d+$/.test(raw)) {
                return;
            }
            setDraft(raw);
            const parsed = Number(raw);
            if (shouldCommit(parsed)) {
                onCommit(parsed);
            }
        },
        [commitUndefinedWhenEmpty, onCommit, shouldCommit]
    );

    const onBlur = useCallback(() => {
        if (draft === '') {
            return;
        }
        const parsed = Number(draft);
        if (!Number.isFinite(parsed)) {
            setDraft(formatDraft(value));
            return;
        }
        if (shouldCommit(parsed)) {
            onCommit(parsed);
            setDraft(String(parsed));
            return;
        }
        setDraft(formatDraft(value));
    }, [draft, onCommit, shouldCommit, value]);

    return { value: draft, onChange, onBlur };
}

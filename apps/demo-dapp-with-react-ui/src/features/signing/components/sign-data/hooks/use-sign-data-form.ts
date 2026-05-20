import { useCallback, useState } from 'react';
import type { SignDataPayload } from '@tonconnect/ui-react';

import { defaultPayloadFor, isSignDataMode, type SignDataMode } from '../utils/payloads';

const stringify = (value: SignDataPayload): string => JSON.stringify(value, null, 2);

/**
 * Holds the sign-data payload as a parsed object (single source of truth) plus
 * a string buffer that backs the JSON editor. Switching mode (Text / Binary /
 * Cell) regenerates the draft from the default payload for that type — manual
 * edits in the JSON are wiped. Also owns the `withConnect` flag (embed the
 * request in the connect URL).
 */
export const useSignDataForm = () => {
    const [mode, setModeState] = useState<SignDataMode>('text');
    const [payload, setPayload] = useState<SignDataPayload>(() => defaultPayloadFor('text'));
    const [draft, setDraft] = useState<string>(() => stringify(payload));
    const [isInvalid, setIsInvalid] = useState(false);
    const [withConnect, setWithConnect] = useState(false);

    const setMode = useCallback((next: SignDataMode) => {
        setModeState(next);
        const fresh = defaultPayloadFor(next);
        setPayload(fresh);
        setDraft(stringify(fresh));
        setIsInvalid(false);
    }, []);

    const onDraftChange = useCallback((next: string) => {
        setDraft(next);
        try {
            const parsed = JSON.parse(next);
            if (parsed && typeof parsed === 'object' && isSignDataMode(parsed.type)) {
                setPayload(parsed as SignDataPayload);
                setIsInvalid(false);
            } else {
                setIsInvalid(true);
            }
        } catch {
            setIsInvalid(true);
        }
    }, []);

    const reset = useCallback(() => {
        setMode('text');
        setWithConnect(false);
    }, [setMode]);

    return {
        mode,
        setMode,
        draft,
        onDraftChange,
        isInvalid,
        payload,
        withConnect,
        setWithConnect,
        reset
    };
};

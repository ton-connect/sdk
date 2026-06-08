import { useCallback, useState } from 'react';

import { useJsonDraftValidation } from '../../../../../core/hooks/use-json-draft-validation';
import { validateSignDataPayload } from '../../../../../core/utils/validation';
import { defaultPayloadFor, type SignDataMode } from '../utils/payloads';

/**
 * Holds the sign-data payload as a parsed object (single source of truth) plus
 * a string buffer that backs the JSON editor. Switching mode (Text / Binary /
 * Cell) regenerates the draft from the default payload for that type — manual
 * edits in the JSON are wiped. Also owns the `withConnect` flag (embed the
 * request in the connect URL).
 */
export const useSignDataForm = () => {
    const [mode, setModeState] = useState<SignDataMode>('text');
    const [withConnect, setWithConnect] = useState(false);

    const {
        value: payload,
        draft,
        onDraftChange,
        replaceValue: replacePayload,
        isInvalid,
        isSendBlocked,
        showInvalidUi,
        editorMessages
    } = useJsonDraftValidation({
        initialValue: defaultPayloadFor('text'),
        validate: parsed => validateSignDataPayload(parsed)
    });

    const setMode = useCallback(
        (next: SignDataMode) => {
            setModeState(next);
            replacePayload(defaultPayloadFor(next));
        },
        [replacePayload]
    );

    const reset = useCallback(() => {
        setMode('text');
        setWithConnect(false);
    }, [setMode]);

    return {
        mode,
        setMode,
        draft,
        onDraftChange,
        replacePayload,
        isInvalid,
        isSendBlocked,
        showInvalidUi,
        editorMessages,
        payload,
        withConnect,
        setWithConnect,
        reset
    };
};

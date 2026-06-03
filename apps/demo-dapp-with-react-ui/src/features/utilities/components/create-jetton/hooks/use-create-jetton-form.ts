import { useCallback } from 'react';

import { useJsonDraftValidation } from '../../../../../core/hooks/use-json-draft-validation';
import { validateCreateJettonRequest } from '../../../../../core/utils/validation';
import { DEFAULT_JETTON_PRESET } from '../utils/default-jetton-preset';

/**
 * Holds the jetton metadata as a parsed object (single source of truth) plus a
 * string buffer that backs the JSON editor. Editor input re-parses on each
 * keystroke; an invalid parse keeps the object intact but flags `isInvalid`.
 */
export function useCreateJettonForm() {
    const {
        value: jetton,
        draft,
        onDraftChange,
        replaceValue,
        isInvalid,
        showInvalidUi,
        editorMessages
    } = useJsonDraftValidation({
        initialValue: DEFAULT_JETTON_PRESET,
        validate: parsed => validateCreateJettonRequest(parsed)
    });

    const reset = useCallback(() => {
        replaceValue(DEFAULT_JETTON_PRESET);
    }, [replaceValue]);

    return {
        jetton,
        draft,
        isInvalid,
        showInvalidUi,
        editorMessages,
        onDraftChange,
        reset
    };
}

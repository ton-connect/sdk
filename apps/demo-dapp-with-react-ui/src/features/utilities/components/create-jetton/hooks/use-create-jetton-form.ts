import { useCallback, useState } from 'react';

import type { CreateJettonRequestDto } from '../../../../../server/dto/create-jetton-request-dto';
import { DEFAULT_JETTON_PRESET } from '../../../lib/default-jetton-preset';

const stringify = (value: CreateJettonRequestDto): string => JSON.stringify(value, null, 2);

/**
 * Holds the jetton metadata as a parsed object (single source of truth) plus a
 * string buffer that backs the JSON editor. Editor input re-parses on each
 * keystroke; an invalid parse keeps the object intact but flags `isInvalid`.
 */
export function useCreateJettonForm() {
    const [jetton, setJetton] = useState<CreateJettonRequestDto>(DEFAULT_JETTON_PRESET);
    const [draft, setDraft] = useState<string>(() => stringify(jetton));
    const [isInvalid, setIsInvalid] = useState(false);

    const onDraftChange = useCallback((next: string) => {
        setDraft(next);
        try {
            const parsed = JSON.parse(next);
            if (parsed && typeof parsed === 'object') {
                setJetton(parsed as CreateJettonRequestDto);
                setIsInvalid(false);
            } else {
                setIsInvalid(true);
            }
        } catch {
            setIsInvalid(true);
        }
    }, []);

    const reset = useCallback(() => {
        setJetton(DEFAULT_JETTON_PRESET);
        setDraft(stringify(DEFAULT_JETTON_PRESET));
        setIsInvalid(false);
    }, []);

    return {
        jetton,
        draft,
        isInvalid,
        onDraftChange,
        reset
    };
}

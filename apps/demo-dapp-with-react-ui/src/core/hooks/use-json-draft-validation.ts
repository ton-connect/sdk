import { useCallback, useEffect, useMemo, useState } from 'react';

import { JSON_SYNTAX_ERROR_MESSAGE, parseJsonObjectDraft } from '../utils/json-draft';
import {
    normalizeJsonValidation,
    type JsonValidationResult
} from '../utils/validation/validation-result';

export interface JsonDraftValidationContext {
    nowSec: number;
}

export type JsonDraftValidator = (
    parsed: unknown,
    context: JsonDraftValidationContext
) => string[] | JsonValidationResult;

export interface UseJsonDraftValidationOptions<T> {
    initialValue: T;
    stringify?: (value: T) => string;
    validate?: JsonDraftValidator;
    /** Re-run validation every second (e.g. for expiring `validUntil`). */
    watchTime?: boolean;
}

const defaultStringify = <T>(value: T): string => JSON.stringify(value, null, 2);

/**
 * Shared draft buffer + semantic JSON validation for demo editors.
 * Keeps the last successfully parsed value when syntax is invalid.
 */
export function useJsonDraftValidation<T>({
    initialValue,
    stringify = defaultStringify,
    validate,
    watchTime = false
}: UseJsonDraftValidationOptions<T>) {
    const [value, setValue] = useState<T>(initialValue);
    const [draft, setDraft] = useState(() => stringify(initialValue));
    const [nowSec, setNowSec] = useState(() => Math.floor(Date.now() / 1000));

    useEffect(() => {
        if (!watchTime) {
            return;
        }

        const id = setInterval(() => setNowSec(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(id);
    }, [watchTime]);

    const draftParse = useMemo(() => parseJsonObjectDraft(draft), [draft]);

    useEffect(() => {
        if (!draftParse.syntaxInvalid) {
            setValue(draftParse.parsed as T);
        }
    }, [draftParse]);

    const { validationErrors, validationWarnings } = useMemo(() => {
        if (draftParse.syntaxInvalid || !validate) {
            return { validationErrors: [], validationWarnings: [] };
        }

        const { errors, warnings } = normalizeJsonValidation(
            validate(draftParse.parsed, { nowSec })
        );
        return { validationErrors: errors, validationWarnings: warnings };
    }, [draftParse, validate, nowSec]);

    const isSyntaxInvalid = draftParse.syntaxInvalid;
    const isInvalid = isSyntaxInvalid || validationErrors.length > 0;
    const editorMessages = isSyntaxInvalid ? [JSON_SYNTAX_ERROR_MESSAGE] : validationErrors;
    const editorWarnings = isSyntaxInvalid ? [] : validationWarnings;

    const replaceValue = useCallback(
        (next: T) => {
            setValue(next);
            setDraft(stringify(next));
        },
        [stringify]
    );

    const onDraftChange = useCallback((next: string) => {
        setDraft(next);
    }, []);

    return {
        value,
        draft,
        onDraftChange,
        replaceValue,
        isInvalid,
        editorMessages,
        editorWarnings,
        validationErrors,
        validationWarnings,
        /** @deprecated Use `validationErrors`. */
        validationIssues: validationErrors,
        isSyntaxInvalid
    };
}

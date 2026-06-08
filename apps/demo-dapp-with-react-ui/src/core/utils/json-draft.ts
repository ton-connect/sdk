export const JSON_SYNTAX_ERROR_MESSAGE = 'Invalid JSON syntax. Fix the JSON before sending.';

export type JsonObjectDraftParse =
    | { syntaxInvalid: true }
    | { syntaxInvalid: false; parsed: unknown };

export function parseJsonObjectDraft(draft: string): JsonObjectDraftParse {
    try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return { syntaxInvalid: false, parsed };
        }
        return { syntaxInvalid: true };
    } catch {
        return { syntaxInvalid: true };
    }
}

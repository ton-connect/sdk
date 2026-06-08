export interface JsonValidationResult {
    errors: string[];
    warnings: string[];
}

export function jsonValidationErrors(result: JsonValidationResult | string[]): string[] {
    return Array.isArray(result) ? result : result.errors;
}

export function jsonValidationWarnings(result: JsonValidationResult | string[]): string[] {
    return Array.isArray(result) ? [] : result.warnings;
}

export function normalizeJsonValidation(
    result: JsonValidationResult | string[]
): JsonValidationResult {
    if (Array.isArray(result)) {
        return { errors: result, warnings: [] };
    }

    return result;
}

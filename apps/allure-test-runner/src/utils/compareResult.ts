export function compareResult(result: unknown, expected: unknown, context: unknown = undefined) {
    const errors: string[] = [];
    const success = compareResultInner(result, expected, context, errors);
    return [success, errors] as const;
}

function compareResultInner(
    result: unknown,
    expected: unknown,
    context: unknown,
    errors: string[],
    path: string = ''
): boolean {
    let success = true;
    const field = path ? `field "${path}"` : 'value';

    if (typeof expected === 'object' && expected !== null) {
        if (typeof result !== 'object' || result === null) {
            errors.push(`${field}: expected object, got ${typeof result}`);
            return false;
        }

        for (const key in expected) {
            const newPath = path ? `${path}.${key}` : key;

            if (key in (result as Record<string, unknown>)) {
                if (
                    !compareResultInner(
                        (result as Record<string, unknown>)[key],
                        (expected as Record<string, unknown>)[key],
                        context,
                        errors,
                        newPath
                    )
                ) {
                    success = false;
                }
            } else {
                success = false;
                errors.push(`field "${newPath}" is missing`);
            }
        }
        return success;
    }

    if (typeof expected === 'function') {
        const passed = expected(result, context);
        if (!passed) {
            errors.push(
                `${field}: value "${result}" failed for predicate ${expected.name || 'predicate'}`
            );
        }
        return passed;
    }

    if (result !== expected) {
        errors.push(`${field}: expected "${expected}", got "${JSON.stringify(result)}"`);
        return false;
    }

    return true;
}

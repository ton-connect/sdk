/**
 * Converts a PascalCase (or camelCase) string to kebab-case.
 *
 * For example:
 * - "PascalCase" → "pascal-case"
 * - "camelCaseExample" → "camel-case-example"
 *
 * @param value - The input string in PascalCase or camelCase format.
 * @returns The converted kebab-case string.
 */
export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

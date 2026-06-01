/** Builds a JSON path such as `messages[0].amount`. */
export function jsonPath(...segments: Array<string | number>): string {
    return segments.reduce<string>((path, segment) => {
        if (typeof segment === 'number') {
            return `${path}[${segment}]`;
        }
        return path ? `${path}.${segment}` : segment;
    }, '');
}

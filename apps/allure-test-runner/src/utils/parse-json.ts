function extractFromCodeFence(input: string): string | null {
    const fence = /```(?:json)?\n([\s\S]*?)\n```/i.exec(input);
    if (fence && fence[1]) return fence[1].trim();
    return null;
}

export function tryParseJson(input: string | undefined | null): unknown | null {
    if (!input) return null;
    // Prefer fenced code blocks
    const fromFence = extractFromCodeFence(input);
    const candidate = fromFence ?? input;
    try {
        return JSON.parse(candidate);
    } catch {
        return null;
    }
}

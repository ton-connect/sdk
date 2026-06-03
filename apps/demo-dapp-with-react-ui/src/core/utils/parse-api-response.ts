export async function parseApiResponse<T extends object>(
    response: Response
): Promise<{ data?: T; error?: string }> {
    const text = await response.text();

    if (!text.trim()) {
        return {
            error: response.ok
                ? 'Empty response from server'
                : `Request failed (HTTP ${response.status})`
        };
    }

    try {
        return { data: JSON.parse(text) as T };
    } catch {
        return {
            error: response.ok
                ? 'Invalid JSON in server response'
                : `Request failed (HTTP ${response.status})`
        };
    }
}

export const DEFAULT_BUTTON_ID = 'ton-connect-button';

const ids: Set<string> = new Set<string>();

export function getButtonIds(): string[] {
    return Array.from(ids);
}

export function addButtonId(id: string): string[] {
    if (!ids.has(id)) {
        ids.add(id);
    }
    return getButtonIds();
}

export function removeButtonId(id: string): string[] {
    ids.delete(id);
    return getButtonIds();
}

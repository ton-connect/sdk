export const DEFAULT_BUTTON_ID = 'ton-connect-button';

let ids: string[] = [];

export function getButtonIds() {
    return [...ids];
}

export function addButtonId(id: string) {
    if (!ids.includes(id)) {
        ids.push(id);
    }
    return getButtonIds();
}

export function removeButtonId(id: string) {
    ids = ids.filter(existingId => existingId !== id);
    return getButtonIds();
} 
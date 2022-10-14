export enum THEME {
    DARK = 'DARK',
    LIGHT = 'LIGHT'
}

export type Theme = keyof typeof THEME | 'SYSTEM';

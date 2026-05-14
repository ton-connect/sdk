/** Built-in UI colour themes. */
export enum THEME {
    DARK = 'DARK',
    LIGHT = 'LIGHT'
}

/** UI colour theme, including automatic system-preference detection. */
export type Theme = THEME | 'SYSTEM';

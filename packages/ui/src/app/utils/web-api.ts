import { THEME } from 'src/models/THEME';

export function openLink(href: string, target = '_self'): void {
    window.open(href, target, 'noreferrer noopener');
}

export function openLinkBlank(href: string): void {
    openLink(href, '_blank');
}

export function getSystemTheme(): THEME {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return THEME.LIGHT;
    }

    return THEME.DARK;
}

export function subscribeToThemeChange(callback: (theme: THEME) => void): () => void {
    const handler = (event: MediaQueryListEvent): void =>
        callback(event.matches ? THEME.DARK : THEME.LIGHT);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
    return () =>
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
}

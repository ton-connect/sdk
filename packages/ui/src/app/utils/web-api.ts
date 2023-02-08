import { THEME } from 'src/models/THEME';
import { ReturnStrategy } from 'src/models/return-strategy';

export function openLink(href: string, target = '_self'): ReturnType<typeof window.open> {
    return window.open(href, target, 'noreferrer noopener');
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

export function addQueryParameter(url: string, key: string, value: string): string {
    const parsed = new URL(url);
    parsed.searchParams.append(key, value);
    return parsed.toString();
}

export function addReturnStrategy(url: string, returnStrategy: ReturnStrategy): string {
    return addQueryParameter(url, 'ret', returnStrategy);
}

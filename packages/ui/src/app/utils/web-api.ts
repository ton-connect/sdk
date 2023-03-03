import { THEME } from 'src/models/THEME';
import { ReturnStrategy } from 'src/models/return-strategy';
import { disableScrollClass, globalStylesTag } from 'src/app/styles/global-styles';
import { toPx } from 'src/app/utils/css';
import { TonConnectUIError } from 'src/errors';

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

export function disableScroll(): void {
    if (document.documentElement.scrollHeight === document.documentElement.clientHeight) {
        return;
    }

    document.body.style.top = toPx(-document.documentElement.scrollTop);
    document.body.classList.add(disableScrollClass);
}

export function enableScroll(): void {
    document.body.classList.remove(disableScrollClass);
    document.documentElement.scrollTo({ top: -parseFloat(getComputedStyle(document.body).top) });
    document.body.style.top = 'auto';
}

export function fixMobileSafariActiveTransition(): void {
    if (!document.body.hasAttribute('ontouchstart')) {
        document.body.setAttribute('ontouchstart', '');
    }
}

export function defineStylesRoot(): void {
    customElements.define(globalStylesTag, class TcRootElement extends HTMLDivElement {}, {
        extends: 'div'
    });
}

export function preloadImages(images: string[]): void {
    images.forEach(img => {
        const node = new window.Image();
        node.src = img;
    });
}

export function checkLocalStorageExists(): never | void {
    if (typeof localStorage === 'undefined') {
        throw new TonConnectUIError(
            'window.localStorage is undefined. localStorage is required for TonConnectUI'
        );
    }
}

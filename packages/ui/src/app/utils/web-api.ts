import { THEME } from 'src/models/THEME';
import { ReturnStrategy } from 'src/models/return-strategy';
import { disableScrollClass, globalStylesTag } from 'src/app/styles/global-styles';
import { toPx } from 'src/app/utils/css';
import { TonConnectUIError } from 'src/errors';
import { UserAgent } from 'src/models/user-agent';
import UAParser from 'ua-parser-js';
import { encodeTelegramUrlParameters, isTelegramUrl } from '@tonconnect/sdk';

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

export function addReturnStrategy(
    url: string,
    strategy:
        | ReturnStrategy
        | { returnStrategy: ReturnStrategy; twaReturnUrl: `${string}://${string}` | undefined }
): string {
    let returnStrategy;
    if (typeof strategy === 'string') {
        returnStrategy = strategy;
    } else {
        returnStrategy = isInTWA() ? strategy.twaReturnUrl || strategy.returnStrategy : 'none';
    }
    const newUrl = addQueryParameter(url, 'ret', returnStrategy);

    if (!isTelegramUrl(url)) {
        return newUrl;
    }

    const lastParam = newUrl.slice(newUrl.lastIndexOf('&') + 1);
    return newUrl.slice(0, newUrl.lastIndexOf('&')) + '-' + encodeTelegramUrlParameters(lastParam);
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
    customElements.define(globalStylesTag, class TcRootElement extends HTMLElement {});
}

/**
 * Preload images after page load to improve UX and Web Vitals metrics without affecting initial page load performance.
 */
export function preloadImages(images: string[]): void {
    if (document.readyState !== 'complete') {
        window.addEventListener('load', () => preloadImages(images), { once: true });
    } else {
        images.forEach(img => {
            const node = new window.Image();
            node.src = img;
        });
    }
}

export function checkLocalStorageExists(): never | void {
    if (typeof localStorage === 'undefined') {
        throw new TonConnectUIError(
            'window.localStorage is undefined. localStorage is required for TonConnectUI'
        );
    }
}

export function getWindow(): Window | undefined {
    if (typeof window !== 'undefined') {
        return window;
    }

    return undefined;
}

export function isMobileUserAgent(): boolean {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.slice(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || (window as unknown as { opera: string }).opera);
    return check;
}

export function getUserAgent(): UserAgent {
    const results = new UAParser().getResult();
    const osName = results.os.name?.toLowerCase();
    let os: UserAgent['os'];
    switch (true) {
        case osName === 'ios':
            os = 'ios';
            break;
        case osName === 'android':
            os = 'android';
            break;
        case osName === 'mac os':
            os = 'macos';
            break;
        case osName === 'linux':
            os = 'linux';
            break;
        case osName?.includes('windows'):
            os = 'windows';
            break;
    }

    const browserName = results.browser.name?.toLowerCase();
    let browser: UserAgent['browser'] | undefined;
    switch (true) {
        case browserName === 'chrome':
            browser = 'chrome';
            break;
        case browserName === 'firefox':
            browser = 'firefox';
            break;
        case browserName?.includes('safari'):
            browser = 'safari';
            break;
    }

    return {
        os,
        browser
    };
}

export function redirectToTelegram(
    universalLink: string,
    options: {
        returnStrategy: ReturnStrategy;
        twaReturnUrl: `${string}://${string}` | undefined;
    }
): void {
    const url = new URL(universalLink);
    url.searchParams.append('startattach', 'tonconnect');

    openLinkBlank(addReturnStrategy(url.toString(), options));
}

export function isInTWA(): boolean {
    return !!(getWindow() as { TelegramWebviewProxy: unknown } | undefined)?.TelegramWebviewProxy;
}

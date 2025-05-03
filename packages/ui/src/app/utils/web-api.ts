import { THEME } from 'src/models/THEME';
import { disableScrollClass, globalStylesTag } from 'src/app/styles/global-styles';
import { toPx } from 'src/app/utils/css';
import { UserAgent } from 'src/models/user-agent';
import UAParser from 'ua-parser-js';
import { InMemoryStorage } from 'src/app/models/in-memory-storage';
import { TonConnectUIError } from 'src/errors';
import { logDebug } from 'src/app/utils/log';

/**
 * Opens a link in a new tab.
 * @param href
 * @param target
 */
export function openLink(href: string, target = '_self'): void {
    logDebug('openLink', href, target);
    window.open(href, target, 'noopener noreferrer');
}

/**
 * Opens a link in a new tab.
 * @param href
 */
export function openLinkBlank(href: string): void {
    openLink(href, '_blank');
}

/**
 * Open a deeplink in the same tab and fallback to a direct link after 200 ms.
 * In Safari, the fallback will not work.
 * @param href
 * @param fallback
 */
export function openDeeplinkWithFallback(href: string, fallback: () => void): void {
    const doFallback = (): void => {
        if (isBrowser('safari') || (isOS('android') && isBrowser('firefox'))) {
            // Safari does not support fallback to direct link.
            return;
        }

        fallback();
    };
    const fallbackTimeout = setTimeout(() => doFallback(), 200);
    window.addEventListener('blur', () => clearTimeout(fallbackTimeout), { once: true });

    openLink(href, '_self');
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
 * Create a macrotask using `requestAnimationFrame()` to ensure that any pending microtasks,
 * such as asynchronous operations from other developers and browser APIs, are executed before.
 * @param callback
 */
export async function createMacrotask(callback: () => void): Promise<void> {
    await new Promise(resolve => requestAnimationFrame(resolve));
    callback();
}

/**
 * Create a macrotask using `requestAnimationFrame()` to ensure that any pending microtasks,
 * such as asynchronous operations from other developers and browser APIs, are executed before.
 * @param callback
 */
export async function createMacrotaskAsync<T>(callback: () => Promise<T>): Promise<T> {
    await new Promise(resolve => requestAnimationFrame(resolve));
    return callback();
}

/**
 * Preload images after page load to improve UX and Web Vitals metrics without affecting initial page load performance.
 */
export function preloadImages(images: string[]): void {
    if (document.readyState !== 'complete') {
        window.addEventListener('load', () => createMacrotask(() => preloadImages(images)), {
            once: true
        });
    } else {
        images.forEach(img => {
            const node = new window.Image();
            node.src = img;
        });
    }
}

export function getWindow(): Window | undefined {
    if (typeof window !== 'undefined') {
        return window;
    }

    return undefined;
}

/**
 * Returns `localStorage` if it is available. In Safari's private mode, it returns `InMemoryStorage`. In Node.js, it throws an error.
 */
export function tryGetLocalStorage(): Storage {
    if (isLocalStorageAvailable()) {
        return localStorage;
    }

    if (isNodeJs()) {
        throw new TonConnectUIError(
            '`localStorage` is unavailable, but it is required for TonConnect. For more details, see https://github.com/ton-connect/sdk/tree/main/packages/sdk#init-connector'
        );
    }

    return InMemoryStorage.getInstance();
}

/**
 * Checks if `localStorage` is available.
 */
function isLocalStorageAvailable(): boolean {
    // We use a try/catch block because Safari's private mode throws an error when attempting to access localStorage.
    try {
        return typeof localStorage !== 'undefined';
    } catch {
        return false;
    }
}

/**
 * Checks if the environment is Node.js.
 */
function isNodeJs(): boolean {
    return (
        typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    );
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
    })(
        navigator.userAgent ||
            navigator.vendor ||
            (
                window as unknown as {
                    opera: string;
                }
            ).opera
    );
    return check;
}

export function getUserAgent(): UserAgent {
    const results = new UAParser().getResult();
    const osName = results.os.name?.toLowerCase();
    const deviceModel = results.device.model?.toLowerCase();
    let os: UserAgent['os'];
    switch (true) {
        case deviceModel === 'ipad':
            os = 'ipad';
            break;
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
        case browserName?.includes('opera'):
            browser = 'opera';
            break;
    }

    return {
        os,
        browser
    };
}

export function isOS(...os: UserAgent['os'][]): boolean {
    return os.includes(getUserAgent().os);
}

export function isBrowser(...browser: UserAgent['browser'][]): boolean {
    return browser.includes(getUserAgent().browser);
}

/**
 * Convert universal link to the given deeplink: replace protocol and path, but keep query params
 * @param universalLink
 * @param deeplink
 */
export function toDeeplink(universalLink: string, deeplink: string): string {
    const url = new URL(universalLink);
    return deeplink + url.search;
}

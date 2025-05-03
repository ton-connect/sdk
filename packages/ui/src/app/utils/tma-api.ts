import { getWindow, openLinkBlank } from 'src/app/utils/web-api';
import { TonConnectUIError } from 'src/errors';
import { logDebug, logError } from 'src/app/utils/log';

type TmaPlatform = 'android' | 'ios' | 'macos' | 'tdesktop' | 'weba' | 'web' | 'unknown';

type TelegramWebviewProxy = {
    postEvent(eventType: string, eventData: string): void;
};

type TelegramWebview = unknown;

declare global {
    interface External {
        notify: (message: string) => void;
    }

    interface Window {
        TelegramWebviewProxy?: TelegramWebviewProxy;
        TelegramWebview?: TelegramWebview;
        Telegram?: {
            WebApp?: {
                platform?: TmaPlatform;
                version?: string;
            };
        };
    }
}

let initParams: Record<string, string> = {};
try {
    let locationHash = location.hash.toString();
    initParams = urlParseHashParams(locationHash);
} catch (e) {}

let tmaPlatform: TmaPlatform = 'unknown';
if (initParams?.tgWebAppPlatform) {
    tmaPlatform = (initParams.tgWebAppPlatform as TmaPlatform) ?? 'unknown';
}
if (tmaPlatform === 'unknown') {
    const window = getWindow();
    tmaPlatform = window?.Telegram?.WebApp?.platform ?? 'unknown';
}

let webAppVersion = '6.0';
if (initParams?.tgWebAppVersion) {
    webAppVersion = initParams.tgWebAppVersion;
}
if (!webAppVersion) {
    const window = getWindow();
    webAppVersion = window?.Telegram?.WebApp?.version ?? '6.0';
}

/**
 * Returns true if the app is running in TMA on the specified platform.
 * @param platforms
 */
export function isTmaPlatform(...platforms: TmaPlatform[]): boolean {
    return platforms.includes(tmaPlatform);
}

/**
 * Returns true if the app is running in TMA.
 */
export function isInTMA(): boolean {
    return tmaPlatform !== 'unknown' || !!getWindow()?.TelegramWebviewProxy;
}

/**
 * Returns true if the app is running in the Telegram browser.
 */
export function isInTelegramBrowser(): boolean {
    const isTelegramWebview = !!getWindow()?.TelegramWebview;

    return (isInTMA() || isTelegramWebview) && tmaPlatform === 'unknown';
}

/**
 * Expand the app window.
 */
export function sendExpand(): void {
    postEvent('web_app_expand', {});
}

/**
 * Opens link in TMA or in new tab and returns a function that closes the tab.
 * @param link The link to open.
 * @param fallback The function to call if the link can't be opened in TMA.
 */
export function sendOpenTelegramLink(link: string, fallback?: () => void): void {
    const url = new URL(link);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        if (fallback) {
            return fallback();
        }
        throw new TonConnectUIError(`Url protocol is not supported: ${url}`);
    }
    if (url.hostname !== 't.me') {
        if (fallback) {
            return fallback();
        }
        throw new TonConnectUIError(`Url host is not supported: ${url}`);
    }

    const pathFull = url.pathname + url.search;

    if (isIframe() || versionAtLeast('6.1')) {
        postEvent('web_app_open_tg_link', { path_full: pathFull });
    } else {
        openLinkBlank('https://t.me' + pathFull);
    }
}

function isIframe(): boolean {
    try {
        const window = getWindow();
        if (!window) {
            return false;
        }
        return window.parent != null && window !== window.parent;
    } catch (e) {
        return false;
    }
}

function postEvent(eventType: 'web_app_open_tg_link', eventData: { path_full: string }): void;
function postEvent(eventType: 'web_app_expand', eventData: {}): void;
function postEvent(eventType: string, eventData: object): void {
    try {
        const window = getWindow();
        if (!window) {
            throw new TonConnectUIError(`Can't post event to parent window: window is not defined`);
        }

        if (window.TelegramWebviewProxy !== undefined) {
            logDebug('postEvent', eventType, eventData);
            window.TelegramWebviewProxy.postEvent(eventType, JSON.stringify(eventData));
        } else if (window.external && 'notify' in window.external) {
            logDebug('postEvent', eventType, eventData);
            window.external.notify(JSON.stringify({ eventType: eventType, eventData: eventData }));
        } else if (isIframe()) {
            const trustedTarget = '*';
            const message = JSON.stringify({ eventType: eventType, eventData: eventData });
            logDebug('postEvent', eventType, eventData);
            window.parent.postMessage(message, trustedTarget);
        } else {
            throw new TonConnectUIError(`Can't post event to TMA`);
        }
    } catch (e) {
        logError(`Can't post event to parent window: ${e}`);
    }
}

function urlParseHashParams(locationHash: string): Record<string, string> {
    locationHash = locationHash.replace(/^#/, '');
    let params: Record<string, string> = {};
    if (!locationHash.length) {
        return params;
    }
    if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
        params._path = urlSafeDecode(locationHash);
        return params;
    }
    let qIndex = locationHash.indexOf('?');
    if (qIndex >= 0) {
        let pathParam = locationHash.substr(0, qIndex);
        params._path = urlSafeDecode(pathParam);
        locationHash = locationHash.substr(qIndex + 1);
    }
    let query_params = urlParseQueryString(locationHash);
    for (let k in query_params) {
        params[k] = query_params[k]!;
    }
    return params;
}

function urlSafeDecode(urlencoded: string): string {
    try {
        urlencoded = urlencoded.replace(/\+/g, '%20');
        return decodeURIComponent(urlencoded);
    } catch (e) {
        return urlencoded;
    }
}

function urlParseQueryString(queryString: string): Record<string, string | null> {
    let params: Record<string, string | null> = {};
    if (!queryString.length) {
        return params;
    }
    let queryStringParams = queryString.split('&');
    let i, param, paramName, paramValue;
    for (i = 0; i < queryStringParams.length; i++) {
        param = queryStringParams[i]!.split('=');
        paramName = urlSafeDecode(param[0]!);
        paramValue = param[1] == null ? null : urlSafeDecode(param[1]);
        params[paramName] = paramValue;
    }
    return params;
}

function versionCompare(v1: string | undefined, v2: string | undefined): 0 | 1 | -1 {
    if (typeof v1 !== 'string') v1 = '';
    if (typeof v2 !== 'string') v2 = '';
    let v1List = v1.replace(/^\s+|\s+$/g, '').split('.');
    let v2List = v2.replace(/^\s+|\s+$/g, '').split('.');
    let a: number, i, p1, p2;
    a = Math.max(v1List.length, v2List.length);
    for (i = 0; i < a; i++) {
        p1 = parseInt(v1List[i]!) || 0;
        p2 = parseInt(v2List[i]!) || 0;
        if (p1 === p2) continue;
        if (p1 > p2) return 1;
        return -1;
    }
    return 0;
}

function versionAtLeast(ver: string): boolean {
    return versionCompare(webAppVersion, ver) >= 0;
}

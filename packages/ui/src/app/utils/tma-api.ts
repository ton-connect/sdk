import { getWindow } from 'src/app/utils/web-api';
import { TonConnectUIError } from 'src/errors';
import { logError } from 'src/app/utils/log';

type TmaPlatform = 'android' | 'ios' | 'macos' | 'tdesktop' | 'web' | 'webk' | 'unknown';

let initParams: Record<string, string> = {};
try {
    let locationHash = location.hash.toString();
    initParams = urlParseHashParams(locationHash);
} catch (e) {}

let tmaPlatform: TmaPlatform = 'unknown';
if (initParams.tgWebAppPlatform) {
    tmaPlatform = initParams.tgWebAppPlatform as TmaPlatform;
}

export function isTwaPlatform(...platforms: TmaPlatform[]): boolean {
    return platforms.includes(tmaPlatform);
}

export function isInTWA(): boolean {
    return (
        tmaPlatform !== 'unknown' ||
        !!(getWindow() as { TelegramWebviewProxy: unknown } | undefined)?.TelegramWebviewProxy
    );
}

export function sendOpenTelegramLink(link: string): void {
    const url = new URL(link);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new TonConnectUIError(`Url protocol is not supported: ${url}`);
    }
    if (url.hostname !== 't.me') {
        throw new TonConnectUIError(`Url host is not supported: ${url}`);
    }

    const pathFull = url.pathname + url.search;

    if (isIframe()) {
        postEvent('web_app_open_tg_link', { path_full: pathFull });
    } else {
        location.href = 'https://t.me' + pathFull;
    }
}

function isIframe(): boolean {
    try {
        return window.parent != null && window !== window.parent;
    } catch (e) {
        return false;
    }
}

function postEvent(eventType: 'web_app_open_tg_link', eventData: { path_full: string }): void;
function postEvent(eventType: string, eventData: object): void {
    try {
        const trustedTarget = '*';
        const message = JSON.stringify({ eventType: eventType, eventData: eventData });
        window.parent.postMessage(message, trustedTarget);
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

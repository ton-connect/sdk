import { getWindow, openLinkBlank, MAX_LINK_LENGTH } from 'src/app/utils/web-api';
import { TonConnectUIError } from 'src/errors';
import { logDebug, logError } from 'src/app/utils/log';
import { setLastOpenedLink } from 'src/app/state/modals-state';
import { removeEmbeddedRequestFromUniversalLink } from 'src/app/utils/url-strategy-helpers';
import { getTmaWebAppVersion, isInTMA } from '@tonconnect/sdk';

/**
 * Telegram messaging. The environment *detection* that used to live here now lives in
 * `@tonconnect/sdk`, so a dApp on the bare SDK reports the same `client_environment` as one
 * using this package — previously only this file could tell a Mini App from a web page, and
 * core reported an empty value.
 *
 * Re-exported below so this module stays the single import site for TMA concerns in the UI.
 */
export {
    getTgUser,
    getTmaPlatform,
    isInTMA,
    isInTelegramBrowser,
    isTmaPlatform
} from '@tonconnect/sdk';

declare global {
    interface External {
        notify: (message: string) => void;
    }

    // Declared again here rather than relied on from core: api-extractor does not carry
    // `declare global` into the rolled-up types, so the messaging half below would not see it.
    interface Window {
        TelegramWebviewProxy?: {
            postEvent(eventType: string, eventData: string): void;
        };
    }
}

/**
 * Returns the detected TMA WebApp version, or null when not in a Mini App.
 */
export function getWebAppVersion(): string | null {
    return isInTMA() ? getTmaWebAppVersion() : null;
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
    if (link.length > MAX_LINK_LENGTH) {
        link = removeEmbeddedRequestFromUniversalLink(link);
    }
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
        // TODO: should be extracted to upper layer
        setLastOpenedLink({ link: pathFull, type: 'tg_link' });
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
    return versionCompare(getTmaWebAppVersion(), ver) >= 0;
}

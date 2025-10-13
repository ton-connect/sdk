import { urlParseHashParams, urlParseQueryString } from 'src/utils/url';
import { getWindow } from 'src/utils/web-api';

declare global {
    interface Window {
        TelegramWebviewProxy?: unknown;
    }
}

let initParams: Record<string, string> = {};
try {
    let locationHash = location.hash.toString();
    initParams = urlParseHashParams(locationHash);
} catch (e) {}

const tmaPlatform = initParams?.tgWebAppPlatform ?? 'unknown';

const initDataRaw = initParams?.tgWebAppData;

type TelegramUser = {
    id: number;
    isPremium: boolean;
};

let telegramUser: TelegramUser | undefined = undefined;

try {
    if (initDataRaw) {
        let initData = urlParseQueryString(initDataRaw);
        let userRaw = initData.user;
        if (userRaw) {
            let user = JSON.parse(userRaw);
            if (typeof user.id === 'number' && typeof user.is_premium === 'boolean') {
                telegramUser = {
                    id: user.id,
                    isPremium: user.is_premium
                };
            }
        }
    }
} catch (e) {}

/**
 * Returns telegram user parsed from telegram initData.
 */
export function getTgUser(): TelegramUser | undefined {
    return telegramUser;
}

/**
 * Returns true if the app is running in TMA.
 */
export function isInTMA(): boolean {
    return tmaPlatform !== 'unknown' || !!getWindow()?.TelegramWebviewProxy;
}

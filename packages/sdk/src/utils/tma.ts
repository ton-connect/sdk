import { getWindow } from 'src/utils/web-api';
import { TelegramUser } from 'src/environment/models/telegram-user';

/**
 * Telegram Mini App environment detection.
 *
 * Lives in core rather than in `@tonconnect/ui` so that `client_environment` is answered the
 * same way for every dApp. Previously only the UI package could tell a Mini App from a web page,
 * so dApps on the bare SDK reported an empty value — and that is exactly the population the
 * connection events exist to make visible.
 *
 * Everything is computed once, on first use rather than at import: resolving it reads
 * `location.hash` and both reads and writes `sessionStorage`, which should not happen merely
 * because someone imported the SDK.
 */

export type TmaPlatform = 'android' | 'ios' | 'macos' | 'tdesktop' | 'weba' | 'web' | 'unknown';

type TelegramWebviewProxy = {
    postEvent(eventType: string, eventData: string): void;
};

declare global {
    interface Window {
        TelegramWebviewProxy?: TelegramWebviewProxy;
        TelegramWebview?: unknown;
        Telegram?: {
            WebApp?: {
                platform?: TmaPlatform;
                version?: string;
            };
        };
    }
}

const LAUNCH_PARAMS_STORAGE_KEY = 'ton-connect-session_storage_launchParams';

function urlSafeDecode(urlencoded: string): string {
    try {
        urlencoded = urlencoded.replace(/\+/g, '%20');
        return decodeURIComponent(urlencoded);
    } catch (e) {
        return urlencoded;
    }
}

function urlParseQueryString(queryString: string): Record<string, string | null> {
    const params: Record<string, string | null> = {};

    if (!queryString.length) {
        return params;
    }

    const queryStringParams = queryString.split('&');
    for (const param of queryStringParams) {
        const pair = param.split('=');
        const paramName = urlSafeDecode(pair[0]!);
        params[paramName] = pair[1] == null ? null : urlSafeDecode(pair[1]);
    }

    return params;
}

function urlParseHashParams(locationHash: string): Record<string, string> {
    locationHash = locationHash.replace(/^#/, '');
    const params: Record<string, string> = {};

    if (!locationHash.length) {
        return params;
    }

    if (locationHash.indexOf('=') < 0 && locationHash.indexOf('?') < 0) {
        params._path = urlSafeDecode(locationHash);
        return params;
    }

    const qIndex = locationHash.indexOf('?');
    if (qIndex >= 0) {
        params._path = urlSafeDecode(locationHash.substring(0, qIndex));
        locationHash = locationHash.substring(qIndex + 1);
    }

    for (const [key, value] of Object.entries(urlParseQueryString(locationHash))) {
        if (value != null) {
            params[key] = value;
        }
    }

    return params;
}

function sessionStorageGet(key: string): Record<string, string> | null {
    try {
        return JSON.parse(getWindow()?.sessionStorage?.getItem?.(key)!);
    } catch (e) {}
    return null;
}

function mergeMissing(target: Record<string, string>, source: Record<string, string | null>) {
    for (const [key, value] of Object.entries(source)) {
        if (value != null && target[key] === undefined) {
            target[key] = value;
        }
    }
}

/**
 * Some Telegram clients store the launch params as a JSON-encoded string, others as a bare query
 * string. A parse failure therefore means "already raw", not "unusable" — dropping it here would
 * lose the platform for every client using the bare form.
 */
function readTappsParams(): Record<string, string | null> {
    let raw: string | null | undefined;
    try {
        raw = getWindow()?.sessionStorage?.getItem?.('tapps/launchParams');
    } catch (e) {}

    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'string') {
            return {};
        }
        raw = parsed;
    } catch (e) {
        // Not JSON — use it as the query string it already is.
    }

    return urlParseQueryString(raw);
}

function readHashParams(): Record<string, string> {
    try {
        return urlParseHashParams(getWindow()?.location?.hash?.toString() ?? '');
    } catch (e) {
        return {};
    }
}

function readInitParams(): Record<string, string> {
    const initParams: Record<string, string> = readHashParams();

    // Ordered by trust: what is live in the URL wins over anything previously stored.
    mergeMissing(initParams, readTappsParams());
    mergeMissing(initParams, sessionStorageGet('__telegram__initParams') ?? {});
    mergeMissing(initParams, sessionStorageGet(LAUNCH_PARAMS_STORAGE_KEY) ?? {});

    try {
        if (Object.keys(initParams).length > 0) {
            getWindow()?.sessionStorage?.setItem(
                LAUNCH_PARAMS_STORAGE_KEY,
                JSON.stringify(initParams)
            );
        }
    } catch (e) {}

    return initParams;
}

function readTelegramUser(initParams: Record<string, string>): TelegramUser | undefined {
    try {
        const initDataRaw = initParams.tgWebAppData;
        if (!initDataRaw) {
            return undefined;
        }

        const userRaw = urlParseQueryString(initDataRaw).user;
        if (!userRaw) {
            return undefined;
        }

        const user = JSON.parse(userRaw);
        // Telegram omits is_premium entirely for non-premium users, so it cannot be required
        // here without dropping most of the audience.
        return typeof user.id === 'number'
            ? { id: user.id, isPremium: user.is_premium === true }
            : undefined;
    } catch (e) {
        return undefined;
    }
}

type TmaEnvironment = {
    platform: TmaPlatform;
    webAppVersion: string;
    telegramUser: TelegramUser | undefined;
};

let cached: TmaEnvironment | undefined;

function detect(): TmaEnvironment {
    if (cached) {
        return cached;
    }

    const initParams = readInitParams();
    const window = getWindow();

    // Both fall back on truthiness, not `??`, so an empty launch param is treated as absent
    // rather than as a real value. With `??`, an empty tgWebAppPlatform would be kept and
    // `isInTMA()` would then report true, since it only compares against 'unknown'.
    let platform: TmaPlatform = 'unknown';
    if (initParams.tgWebAppPlatform) {
        platform = initParams.tgWebAppPlatform as TmaPlatform;
    }
    if (platform === 'unknown') {
        platform = window?.Telegram?.WebApp?.platform ?? 'unknown';
    }

    // Deliberately does NOT consult window.Telegram.WebApp.version. The original guarded that
    // fallback with `if (!webAppVersion)` after seeding the variable with '6.0', so it could
    // never run. Reproducing the dead branch keeps `versionAtLeast()` — which decides how
    // sendOpenTelegramLink opens links — behaving exactly as it does today. Changing it is a
    // behavioural fix that does not belong in an analytics change.
    let webAppVersion = '6.0';
    if (initParams.tgWebAppVersion) {
        webAppVersion = initParams.tgWebAppVersion;
    }

    cached = {
        platform,
        webAppVersion,
        telegramUser: readTelegramUser(initParams)
    };

    return cached;
}

/** The Telegram Mini App platform, or `'unknown'` outside one. */
export function getTmaPlatform(): TmaPlatform {
    return detect().platform;
}

/** `true` when running inside a Telegram Mini App on one of the given platforms. */
export function isTmaPlatform(...platforms: TmaPlatform[]): boolean {
    return platforms.includes(detect().platform);
}

/** `true` when running inside a Telegram Mini App. */
export function isInTMA(): boolean {
    return detect().platform !== 'unknown' || !!getWindow()?.TelegramWebviewProxy;
}

/** `true` when running in the Telegram in-app browser rather than a Mini App. */
export function isInTelegramBrowser(): boolean {
    return (isInTMA() || !!getWindow()?.TelegramWebview) && detect().platform === 'unknown';
}

/**
 * The Telegram WebApp version, defaulting to `'6.0'`. Returned regardless of whether a Mini App
 * was detected, for feature checks that need to compare versions.
 */
export function getTmaWebAppVersion(): string {
    return detect().webAppVersion;
}

/** The Telegram user from the Mini App launch parameters, when present. */
export function getTgUser(): TelegramUser | undefined {
    return detect().telegramUser;
}

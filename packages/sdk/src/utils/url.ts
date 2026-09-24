export function removeUrlLastSlash(url: string): string {
    if (url.slice(-1) === '/') {
        return url.slice(0, -1);
    }

    return url;
}

export function addPathToUrl(url: string, path: string): string {
    return removeUrlLastSlash(url) + '/' + path;
}

/**
 * Type guard for Telegram links — matches both the `tg://` scheme and
 * `https://t.me/…`.
 */
export function isTelegramUrl(link: string | undefined): link is string {
    if (!link) {
        return false;
    }

    const url = new URL(link);
    return url.protocol === 'tg:' || url.hostname === 't.me';
}

/**
 * Type guard for the subset of Telegram links that address a mini app rather
 * than a native Telegram surface. TON Connect parameters travel inside
 * `startapp`, which only a mini app ever receives, so this guard — not
 * {@link isTelegramUrl} — is what selects the mini-app transport. A mini-app
 * link either names the bot and the app in its path (`t.me/<bot>/<app>`) or
 * asks for the attachment menu (`?attach=`), which resolves to the same pair.
 */
export function isTelegramMiniAppUrl(link: string | undefined): link is string {
    if (!isTelegramUrl(link)) {
        return false;
    }

    const url = new URL(link);
    if (url.searchParams.has('attach')) {
        return true;
    }

    const [, bot, appName] = url.pathname.split('/');
    return !!bot && !!appName;
}

/**
 * Type guard that returns `true` when `link` looks like a TON Connect connect
 * URL — i.e. it carries the `ton_addr` request item (raw or
 * Telegram-encoded). Useful for discriminating handler URLs in deep-link
 * routers.
 */
export function isConnectUrl(link: string | undefined): link is string {
    if (!link) {
        return false;
    }

    return link.includes('ton_addr') || link.includes('ton--5Faddr');
}

/**
 * Encode query parameters for transport inside a Telegram universal link.
 * Telegram normalizes ASCII punctuation in URLs, which breaks the encoded
 * connect payload; this helper substitutes the affected characters with
 * pass-through markers that {@link decodeTelegramUrlParameters} reverses.
 */
export function encodeTelegramUrlParameters(parameters: string): string {
    return parameters
        .replaceAll('.', '%2E')
        .replaceAll('-', '%2D')
        .replaceAll('_', '%5F')
        .replaceAll('&', '-')
        .replaceAll('=', '__')
        .replaceAll('%', '--');
}

/** Inverse of {@link encodeTelegramUrlParameters}. */
export function decodeTelegramUrlParameters(parameters: string): string {
    return parameters
        .replaceAll('--', '%')
        .replaceAll('__', '=')
        .replaceAll('-', '&')
        .replaceAll('%5F', '_')
        .replaceAll('%2D', '-')
        .replaceAll('%2E', '.');
}

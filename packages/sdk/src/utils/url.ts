export function removeUrlLastSlash(url: string): string {
    if (url.slice(-1) === '/') {
        return url.slice(0, -1);
    }

    return url;
}

export function addPathToUrl(url: string, path: string): string {
    return removeUrlLastSlash(url) + '/' + path;
}

export function isTelegramUrl(link: string | undefined): link is string {
    if (!link) {
        return false;
    }

    const url = new URL(link);
    return url.protocol === 'tg:' || url.hostname === 't.me';
}

export function encodeTelegramUrlParameters(parameters: string): string {
    return parameters
        .replaceAll('.', '%2E')
        .replaceAll('-', '%2D')
        .replaceAll('_', '%5F')
        .replaceAll('&', '-')
        .replaceAll('=', '__')
        .replaceAll('%', '--');
}

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

export function decodeTelegramUrlParameters(parameters: string): string {
    return parameters
        .replaceAll('--', '%')
        .replaceAll('__', '=')
        .replaceAll('-', '&')
        .replaceAll('%5F', '_')
        .replaceAll('%2D', '-')
        .replaceAll('%2E', '.');
}

export function urlParseHashParams(locationHash: string): Record<string, string> {
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

export function urlSafeDecode(urlencoded: string): string {
    try {
        urlencoded = urlencoded.replace(/\+/g, '%20');
        return decodeURIComponent(urlencoded);
    } catch (e) {
        return urlencoded;
    }
}

export function urlParseQueryString(queryString: string): Record<string, string | null> {
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

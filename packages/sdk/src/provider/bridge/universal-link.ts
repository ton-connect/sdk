import { Base64, ConnectRequest, WireEmbeddedRequest } from '@tonconnect/protocol';
import { Traceable } from 'src/utils/types';
import { encodeTelegramUrlParameters, isTelegramUrl } from 'src/utils/url';
import { PROTOCOL_VERSION } from 'src/resources/protocol';
import { toBase64Url } from 'src/utils/base64';

export function generateUniversalLink(
    universalLink: string,
    message: ConnectRequest,
    options: Traceable<{ sessionId: string; embeddedRequest?: WireEmbeddedRequest }>
): string {
    if (isTelegramUrl(universalLink)) {
        return generateTGUniversalLink(universalLink, message, options);
    }

    return generateRegularUniversalLink(universalLink, message, options);
}

function generateRegularUniversalLink(
    universalLink: string,
    message: ConnectRequest,
    options: Traceable<{ sessionId: string; embeddedRequest?: WireEmbeddedRequest }>
): string {
    const url = new URL(universalLink);
    url.searchParams.append('v', PROTOCOL_VERSION.toString());
    url.searchParams.append('id', options.sessionId);
    url.searchParams.append('trace_id', options.traceId);
    url.searchParams.append('r', JSON.stringify(message));
    if (options.embeddedRequest) {
        url.searchParams.append(
            'e',
            toBase64Url(Base64.encode(JSON.stringify(options.embeddedRequest), false))
        );
    }
    return url.toString();
}

function generateTGUniversalLink(
    universalLink: string,
    message: ConnectRequest,
    options: Traceable<{ sessionId: string; embeddedRequest?: WireEmbeddedRequest }>
): string {
    const urlToWrap = generateRegularUniversalLink('about:blank', message, options);
    const linkParams = urlToWrap.split('?')[1]!;

    const startapp = 'tonconnect-' + encodeTelegramUrlParameters(linkParams);

    // TODO: Remove this line after all dApps and the wallets-list.json have been updated
    const updatedUniversalLink = convertToDirectLink(universalLink);

    const url = new URL(updatedUniversalLink);
    url.searchParams.append('startapp', startapp);
    return url.toString();
}

// TODO: Remove this method after all dApps and the wallets-list.json have been updated
function convertToDirectLink(universalLink: string): string {
    const url = new URL(universalLink);

    if (url.searchParams.has('attach')) {
        url.searchParams.delete('attach');
        url.pathname += '/start';
    }

    return url.toString();
}

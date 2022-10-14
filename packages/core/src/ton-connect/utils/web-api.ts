import { DappMetadata } from 'src/ton-connect';

export function getWebPageMetadata(): DappMetadata {
    return {
        url: window?.location.href,
        icon: window?.location.origin + '/favicon.ico',
        name: document?.title
    };
}

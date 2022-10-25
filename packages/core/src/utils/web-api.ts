import { DappMetadata } from 'src/models';

export function getWebPageMetadata(): DappMetadata {
    return {
        url: window?.location.href || '',
        icon: window?.location.origin ? window?.location.origin + '/favicon.ico' : '',
        name: document?.title || 'Unknown dapp'
    };
}

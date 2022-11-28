import { DappMetadata } from 'src/models';

export function getWindow(): Window | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window;
}

export function getDocument(): Document | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }

    return document;
}

export function getWebPageMetadata(): DappMetadata {
    return {
        url: getWindow()?.location.origin || '',
        icon: getIconUrl(),
        name: getDocument()?.title || 'Unknown dapp'
    };
}

function getIconUrl(): string {
    const document = getDocument();
    if (!document) {
        return '';
    }

    const appleTouchIcons = document.querySelectorAll<HTMLLinkElement>(
        "link[rel='apple-touch-icon']"
    );

    if (appleTouchIcons?.length) {
        return getLargestSizeIconUrl(Array.from(appleTouchIcons));
    }

    const links = Array.from(document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']"));

    const pngLinks = links.filter(link => link.href.endsWith('.png'));

    if (pngLinks.length) {
        return getLargestSizeIconUrl(pngLinks);
    }

    const icoIcon = links.filter(link => link.href.endsWith('.ico'))[0];

    return icoIcon?.href || '';
}

function getLargestSizeIconUrl(links: HTMLLinkElement[]): string {
    const parsedLinks = links.map(parseIconLink);

    const maxSizeIcon = parsedLinks.sort((a, b) => (b.size > a.size ? 1 : -1))[0];

    return maxSizeIcon?.href || '';
}

function parseIconLink(link: HTMLLinkElement): { href: string; size: number } {
    if (!link.sizes?.value) {
        return {
            href: link.href,
            size: 0
        };
    }

    const sizes: number[] = Array.from(link.sizes)
        .map(size => {
            const groups = size.match(/(\d+)x(\d+)/i);
            if (!groups || !groups[1] || !groups[2]) {
                return undefined;
            }

            return parseInt(groups[1]) * parseInt(groups[2]);
        })
        .filter(item => !!item) as number[];

    if (sizes.length === 0) {
        return {
            href: link.href,
            size: 0
        };
    }

    return {
        href: link.href,
        size: Math.max.apply(Math, sizes)
    };
}

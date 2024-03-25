import { getWindow, isOS } from 'src/app/utils/web-api';
import { isTmaPlatform } from 'src/app/utils/tma-api';

export type Device = 'mobile' | 'tablet' | 'desktop';

export const maxWidth = {
    mobile: 440,
    tablet: 1020
};

export function isDevice(device: keyof typeof maxWidth | 'desktop'): boolean {
    const window = getWindow();
    if (!window) {
        return device === 'desktop';
    }

    // TODO: remove this check when weba will fix viewport width
    if (isTmaPlatform('weba')) {
        return true;
    }

    const width = window.innerWidth;

    switch (device) {
        case 'desktop':
            return width > maxWidth.tablet;
        case 'tablet':
            return width > maxWidth.mobile;
        default:
        case 'mobile':
            return width <= maxWidth.mobile || isOS('ios', 'android', 'ipad');
    }
}

export function media(device: Device): string {
    switch (device) {
        case 'mobile':
            return `@media (max-width: ${maxWidth.mobile}px)`;
        case 'tablet':
            return `@media (max-width: ${maxWidth.tablet}px) (min-width: ${maxWidth.mobile}px)`;
        default:
        case 'desktop':
            return `@media (min-width: ${maxWidth.tablet}px)`;
    }
}

export function mediaMin(px: number): string {
    return `@media (min-width: ${px}px)`;
}

export function mediaMax(px: number): string {
    return `@media (max-width: ${px}px)`;
}

export function mediaMinMax(pxMin: number, pxMax: number): string {
    return `@media (min-width: ${pxMin}px) and (max-width: ${pxMax}px)`;
}

export const mediaTouch = '@media (hover: none)';

export const mediaNotTouch = '@media not all and (hover: none)';

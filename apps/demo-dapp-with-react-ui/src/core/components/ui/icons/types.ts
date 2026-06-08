import type { ComponentProps } from 'react';

/**
 * Standard props for all icon components.
 *
 * Icons render an `<svg>` whose dimensions are controlled by `size`. Color is
 * inherited from `currentColor`, so style icons by setting `color` on a parent.
 */
export interface IconProps extends Omit<ComponentProps<'svg'>, 'width' | 'height'> {
    size?: number;
}

/** Default size in pixels for all icons. Override via the `size` prop. */
export const DEFAULT_ICON_SIZE = 24;

import { DefaultTheme } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { THEME } from 'src/models/THEME';

/**
 * The pill of the TON site's chips and secondary buttons: a translucent surface with a thin light
 * edge along the top where the light falls. As the site's blocks are on its page, it is lighter
 * than the sheet in either theme: a wash of the blue-grey secondary colour in the dark one,
 * near-white in the light one, where a soft shadow sets it off. `lightOpacity` sets how white it is
 * in the light theme.
 *
 * It blurs nothing itself: it sits on the glass sheet, which has already blurred the page, and
 * Safari draws a blur inside a blur in tiles that flicker as dark squares.
 */
export function chip(theme: DefaultTheme, lightOpacity = 0.72): string {
    const isDark = theme.theme === THEME.DARK;
    const fill = isDark
        ? rgba(theme.colors.icon.secondary, 0.14)
        : `rgba(255, 255, 255, ${lightOpacity})`;
    const shadow = isDark
        ? 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)'
        : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), 0 1px 4px rgba(0, 0, 0, 0.12)';

    return `
        background-color: ${fill};
        border: none;
        box-shadow: ${shadow};
    `;
}

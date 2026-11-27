import { DefaultTheme } from 'solid-styled-components';
import { THEME } from 'src/models/THEME';
import { rgba } from 'src/app/utils/css';

const supportsBlur =
    '@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))';
// Safari does not pass the system's reduce-transparency setting to pages, so the glass is made
// dense enough to read on any page; these queries only add a solid surface where they exist.
const reducedTransparency =
    '@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)';

/**
 * Translucent surface that blurs the dApp page behind it, so busy content turns into soft colour,
 * with a thin light edge along the top where the light falls, like the TON site's chips. It is
 * dense and only lightly saturated, so it keeps a neutral colour on any page and secondary text
 * keeps its contrast; the tall All wallets sheet is denser still.
 *
 * Where the browser cannot blur, or the user asked for less transparency or more contrast, the
 * surface stays solid in the theme's colour, so text never sits on an unblurred page.
 *
 * The blur only sees the page while no ancestor of the surface has `opacity` below 1 or a
 * `filter`: such an ancestor becomes the backdrop, so fade the overlay, never a parent.
 */
export function glassSurface(theme: DefaultTheme): string {
    const isDark = theme.theme === THEME.DARK;
    // In dark themes the primary background is near black, so the glass is made of the lighter
    // tint and the page shows through it instead of being swallowed.
    const base = isDark ? theme.colors.background.tint : theme.colors.background.primary;
    const edge = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)';

    return `
        position: relative;
        background-color: ${base};
        border: none;
        box-shadow:
            inset 0 1px 1px 0 ${edge},
            0 28px 80px ${isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 20, 60, 0.2)'},
            0 2px 10px ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)'};

        ${supportsBlur} {
            background-color: ${rgba(base, isDark ? 0.8 : 0.86)};
            -webkit-backdrop-filter: blur(48px) saturate(${isDark ? 130 : 140}%);
            backdrop-filter: blur(48px) saturate(${isDark ? 130 : 140}%);

            &:has([data-tc-wallets-modal-list='true']) {
                background-color: ${rgba(base, 0.94)};
            }
        }

        ${reducedTransparency} {
            background-color: ${base};
            -webkit-backdrop-filter: none;
            backdrop-filter: none;
        }
    `;
}

import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components/button';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

// `100vh` always exceeds half the button's height, so the browser clamps it to a pill.
// `none` still opts out of rounding entirely, as the dApp asked for.
const borders: BorderRadiusConfig = {
    m: '100vh',
    s: '100vh',
    none: '0'
};

/**
 * Geometry shared by the full-width connect buttons; each variant adds its own colours, and
 * each screen adds its own width and margins.
 *
 * The height is fixed rather than derived from padding so that icons of different sizes (the
 * 15px Telegram glyph vs a 24px wallet icon) can't make one button taller than another. It
 * matches the tallest content — a 24px wallet icon plus 14px padding — so equalising grows the
 * shorter button instead of shrinking the taller one.
 */
export const ConnectButtonStyled = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 52px;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    padding: 0 16px;
`;

/**
 * Keeps the button icon inline with the label, centred as a single unit. The icon can't be
 * passed as the `Button` `leftIcon` — that switches the button to `justify-content: space-between`,
 * which pushes the icon to the far edge instead.
 *
 * Typography lives here rather than on the button: `Button` brings its own `font-size`/`font-weight`
 * from the shared `ButtonStyled`, and which of the two single-class rules wins depends on
 * stylesheet insertion order, which goober varies (it prepends when a generated class is passed
 * down, and skips re-inserting CSS it has already emitted). This element has no competing rule,
 * so the result is the same on every render.
 */
export const ButtonLabelStyled = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
`;

import { css, keyframes, styled } from 'solid-styled-components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';

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
 *
 * A plain `button` rather than `Button`: goober emits a rule once, so the `ButtonStyled` rule the
 * header connect button emitted earlier would outrank the colours each variant sets.
 */
export const ConnectButtonStyled = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 52px;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    padding: 0 16px;
    border: none;
    cursor: pointer;

    transition: transform 0.125s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.02);
        }
    }

    &:active {
        transform: scale(0.98);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.96);
        }
    }
`;

/** Keeps the button icon inline with the label, centred as a single unit. */
export const ButtonLabelStyled = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
`;

// Crosses in the first 0.75 s of every 2 s
const shine = keyframes`
    0% {
        transform: translateX(-100%);
    }
    37.5%,
    100% {
        transform: translateX(100%);
    }
`;

/**
 * A light band crosses the button, then stays off it for as long, as on the upgrade buttons of the
 * Telegram apps. `--tc-shine-opacity` dims the band.
 */
export const shinyClass = css`
    position: relative;
    overflow: hidden;

    &::before {
        content: '';

        position: absolute;
        top: 0;
        left: 0;

        width: 100%;
        height: 100%;

        pointer-events: none;

        opacity: var(--tc-shine-opacity, 1);
        background: linear-gradient(
            to right,
            transparent 0%,
            rgba(232, 232, 232, 0.3) 50%,
            transparent 100%
        );

        animation: ${shine} 2s ease-out infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        &::before {
            display: none;
        }
    }
`;

import { keyframes, styled } from 'solid-styled-components';
import { Text } from '../typography/text';
import { Image } from '../image';
import { mediaNotTouch, mediaTouch, sheetLayout } from 'src/app/styles/media';
import { WalletImage } from './wallet-image';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { rgba } from 'src/app/utils/css';
import { THEME } from 'src/models/THEME';
import { PRESS_TRANSITION } from 'src/app/styles/motion';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '12px',
    none: '0'
};

const badgeBorders: BorderRadiusConfig = {
    m: '6px',
    s: '6px',
    none: '0'
};

/**
 * The row of wallets, scrolling sideways. Its 16px top padding leaves room inside the scrolling
 * area for the glow behind Gram Wallet's icon.
 */
export const WalletUlContainer = styled.ul`
    display: flex;
    gap: 0;
    width: 100%;
    overflow-x: auto;
    padding: 16px 12px 16px 12px;
    margin: 0;
    list-style: none;
    flex-wrap: nowrap;

    &&::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;

    > li {
        display: flex;
        flex: 1;
        min-width: 78px;
        height: fit-content;
    }

    > li > button {
        width: 100%;
    }
`;

export const WalletItemStyled = styled.button`
    position: relative;
    cursor: pointer;
    border: none;
    background-color: unset;
    padding: 8px 2px;
    min-width: 78px;
    display: flex;
    flex-direction: column;
    align-items: center;

    transition: ${PRESS_TRANSITION};

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;

/**
 * The connect button's shine (`shinyClass`): a soft band as wide as the icon crosses it from left to
 * right in the first 0.75 s of every 6 s, so it catches the eye now and then without flickering.
 * The band sits in the middle third of a background three times the icon's width, so at either end
 * of its run it is wholly off the icon.
 */
const iconShine = keyframes`
    0% {
        background-position: 100% 0;
    }

    12.5%,
    100% {
        background-position: 0% 0;
    }
`;

/**
 * The wallet's icon. With `glow` (the wallet the lists lead with) a soft halo of the connect blue
 * spreads out from under it on the phone sheet; the desktop dialog leaves it out. With `shine` a
 * gentle shine passes over it now and then; with reduced motion the shine stays still, off the
 * icon. The shine has a layer of its own (`will-change`), so Safari does not redraw the glass sheet
 * around it. `round` is for an icon drawn as a circle, such as Telegram's, so the shine and the
 * edge keep to the circle.
 */
export const ImageStyled = styled(WalletImage)<{
    glow?: boolean;
    shine?: boolean;
    round?: boolean;
}>`
    width: 60px;
    height: 60px;
    border-radius: ${props => (props.round ? '50%' : borders[props.theme!.borderRadius])};
    margin-bottom: 8px;
    position: relative;

    ${props =>
        props.glow
            ? `
        ${sheetLayout} {
            box-shadow: 0 0 20px 2px ${rgba(
                props.theme!.colors.connectButton.background,
                props.theme!.theme === THEME.DARK ? 0.45 : 0.35
            )};
        }
    `
            : ''}

    ${props =>
        props.shine
            ? `
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
            border-radius: inherit;
            pointer-events: none;
            background: linear-gradient(
                    to right,
                    transparent 33.33%,
                    rgba(232, 232, 232, 0.3) 50%,
                    transparent 66.67%
                )
                no-repeat;
            background-size: 300% 100%;
            background-position: 100% 0;
            animation: ${iconShine} 6s ease-out 1.5s infinite;
            will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
            &::before {
                animation: none;
            }
        }
    `
            : ''}
`;

export const BadgeStyled = styled(Image)`
    position: absolute;
    right: -6px;
    bottom: -6px;
    width: 24px;
    height: 24px;
    border-radius: ${props => badgeBorders[props.theme!.borderRadius]};
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
`;

/** Long names wrap onto a second line instead of being squeezed and cut. */
export const StyledText = styled(Text)`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    width: 100%;
    max-width: 90px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: -0.1px;
    text-align: center;
    overflow-wrap: break-word;
`;

export const StyledSecondLine = styled(Text)<{ colorPrimary: boolean }>`
    font-weight: ${props => (props.colorPrimary ? '510' : '400')};
    max-width: 90px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: ${props =>
        props.colorPrimary ? props.theme!.colors.text.primary : props.theme!.colors.text.secondary};
`;

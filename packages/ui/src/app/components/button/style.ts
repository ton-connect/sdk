import { DefaultTheme, styled } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { chip } from 'src/app/styles/chip';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';
import { THEME } from 'src/models/THEME';
import { PRESS_TRANSITION } from 'src/app/styles/motion';

const borders: BorderRadiusConfig = {
    m: '100vh',
    s: '8px',
    none: '0'
};

const scaleValues = {
    s: 0.02,
    m: 0.04
};

/** The blue of default buttons, label and icon alike: the dApp's connect button colour. */
export function buttonBlue(theme: DefaultTheme): string {
    return theme.colors.connectButton.background;
}

/**
 * The light from above on the default button, with no shadow outside it. On the dark sheet a line
 * of the button's blue is lighter than the fill; on the light sheet it would be darker and read as
 * a groove, so there the edge is white.
 */
function primaryEdge(theme: DefaultTheme): string {
    return theme.theme === THEME.DARK
        ? `inset 0 1px 1px 0 ${rgba(buttonBlue(theme), 0.22)}`
        : 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.75)';
}

/**
 * The neutral pill of secondary controls, in the manner of the TON site. In the light theme it is
 * half white, so the sheet's colours still show through it.
 */
export function plainFill(theme: DefaultTheme): string {
    return chip(theme, 0.5);
}

/**
 * Fill and label colour of each appearance. The default button is blue all through, label and icon
 * alike, on a tint of the same blue (`buttonBlue`) with a thin light edge on top (`primaryEdge`),
 * which stays blue in the dark theme, where the accent is near white. `secondary` is a neutral pill
 * and `plain` the blue tint without the edge. Flat buttons are links in the accent. `filled` is the
 * one action a screen leads with, in the connect button's colours.
 */
function appearanceStyles(appearance: ButtonAppearance, theme: DefaultTheme): string {
    switch (appearance) {
        case 'flat':
            return `
                background-color: transparent;
                border: none;
                color: ${theme.colors.accent};
            `;
        case 'secondary':
            return `
                ${plainFill(theme)}
                color: ${theme.colors.text.primary};
            `;
        case 'plain':
            return `
                background-color: ${rgba(buttonBlue(theme), 0.14)};
                border: none;
                box-shadow: none;
                color: ${buttonBlue(theme)};
            `;
        case 'filled':
            return `
                background-color: ${theme.colors.connectButton.background};
                border: none;
                color: ${theme.colors.connectButton.foreground};
            `;
        default:
            return `
                background-color: ${rgba(buttonBlue(theme), 0.14)};
                border: none;
                box-shadow: ${primaryEdge(theme)};
                color: ${buttonBlue(theme)};
            `;
    }
}

type ButtonAppearance = 'primary' | 'flat' | 'secondary' | 'filled' | 'plain';

export const ButtonStyled = styled.button<{
    appearance: ButtonAppearance;
    scale: 's' | 'm';
    leftIcon: boolean;
    rightIcon: boolean;
}>`
    display: ${props => (props.leftIcon || props.rightIcon ? 'flex' : 'inline-block')};
    gap: ${props => (props.leftIcon || props.rightIcon ? '6px' : 'unset')};
    align-items: ${props => (props.leftIcon || props.rightIcon ? 'center' : 'unset')};
    justify-content: ${props => (props.leftIcon || props.rightIcon ? 'space-between' : 'unset')};
    ${props => appearanceStyles(props.appearance, props.theme!)}

    padding: ${props => (props.appearance === 'flat' ? '0' : '9px 16px')};
    padding-left: ${props => (props.leftIcon && props.appearance !== 'flat' ? '12px' : '16px')};
    padding-right: ${props => (props.rightIcon && props.appearance !== 'flat' ? '12px' : '16px')};
    border-radius: ${props => borders[props.theme!.borderRadius]};
    cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};

    font-size: 15px;
    font-weight: 500;
    line-height: 20px;

    transition: ${PRESS_TRANSITION};

    ${mediaNotTouch} {
        &:hover {
            transform: ${props =>
                props.disabled ? 'unset' : `scale(${1 + scaleValues[props.scale]})`};
        }
    }

    &:active {
        transform: ${props =>
            props.disabled ? 'unset' : `scale(${1 - scaleValues[props.scale]})`};
    }

    ${mediaTouch} {
        &:active {
            transform: ${props =>
                props.disabled ? 'unset' : `scale(${1 - scaleValues[props.scale] * 2})`};
        }
    }
`;

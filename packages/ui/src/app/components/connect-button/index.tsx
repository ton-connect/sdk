import cn from 'classnames';
import { Component, JSXElement } from 'solid-js';
import { styled } from 'solid-styled-components';
import { rgba } from 'src/app/utils/css';
import { Styleable } from 'src/app/models/styleable';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { ButtonLabelStyled, ConnectButtonStyled, shinyClass } from './style';

export interface ConnectButtonProps extends Styleable, WithDataAttributes {
    /** Rendered inline, immediately before the label. */
    icon: JSXElement;

    onClick: () => void;

    children: JSXElement;

    /** Draws attention with a light band crossing the button twice, then stopping. */
    shiny?: boolean;

    /** Dims the band, from 0 to 1. */
    shineOpacity?: number;
}

/**
 * Full-width button that promotes a single wallet out of the wallets row. It only reports the
 * click — selecting the wallet runs through the same path as picking it from the row, so there is
 * no separate connect flow to keep in sync.
 *
 * Callers style it for their screen with `styled(ConnectButton)`.
 */
export const ConnectButton: Component<ConnectButtonProps> = props => {
    const dataAttrs = useDataAttributes(props);

    return (
        <ConnectButtonStyled
            type="button"
            class={cn(props.class, props.shiny && shinyClass)}
            style={{ '--tc-shine-opacity': props.shineOpacity?.toString() }}
            onClick={() => props.onClick()}
            data-tc-button="true"
            {...dataAttrs}
        >
            <ButtonLabelStyled>
                {props.icon}
                {props.children}
            </ButtonLabelStyled>
        </ConnectButtonStyled>
    );
};

/**
 * Telegram-branded variant, the one glass control on the sheet: its colour under a sheen that
 * fades down from the top, a bright rim along the top edge where the light falls, and a glow below
 * in its own colour. Screens add their own width and margins.
 */
export const TelegramConnectButton = styled(ConnectButton)`
    background-color: ${props => props.theme!.colors.telegramButton};
    background-image: linear-gradient(
        180deg,
        rgba(255, 255, 255, 0.14) 0%,
        rgba(255, 255, 255, 0.04) 50%,
        rgba(255, 255, 255, 0) 100%
    );
    box-shadow:
        0 5px 15px ${props => rgba(props.theme!.colors.telegramButton, 0.25)},
        inset 0 1px 0.5px rgba(255, 255, 255, 0.45),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
    color: ${props => props.theme!.colors.constant.white};
`;

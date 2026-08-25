import { Component, JSXElement } from 'solid-js';
import { styled } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';
import { ButtonLabelStyled, ConnectButtonStyled } from './style';

export interface ConnectButtonProps extends Styleable {
    /** Rendered inline, immediately before the label. */
    icon: JSXElement;

    onClick: () => void;

    children: JSXElement;
}

/**
 * Full-width button that promotes a single wallet out of the wallets row. It only reports the
 * click — selecting the wallet runs through the same path as picking it from the row, so there is
 * no separate connect flow to keep in sync.
 *
 * Callers style it for their screen with `styled(ConnectButton)`.
 */
export const ConnectButton: Component<ConnectButtonProps> = props => {
    return (
        <ConnectButtonStyled class={props.class} onClick={() => props.onClick()} scale="s">
            <ButtonLabelStyled>
                {props.icon}
                {props.children}
            </ButtonLabelStyled>
        </ConnectButtonStyled>
    );
};

/** Telegram-branded variant. Screens add their own width and margins on top. */
export const TelegramConnectButton = styled(ConnectButton)`
    background-color: ${props => props.theme!.colors.telegramButton};
    color: ${props => props.theme!.colors.constant.white};
`;

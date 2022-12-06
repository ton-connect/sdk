import { Component, JSXElement } from 'solid-js';
import { ActionModalStyled, ButtonStyled, H1Styled, TextStyled } from './style';

interface ActionModalProps {
    title: string;
    icon: JSXElement;
    children?: JSXElement;
    onClose: () => void;
}

export const ActionModal: Component<ActionModalProps> = props => {
    return (
        <ActionModalStyled>
            {props.icon}
            <H1Styled>{props.title}</H1Styled>
            {typeof props?.children === 'string' ? (
                <TextStyled>{props.children}</TextStyled>
            ) : (
                props.children
            )}
            <ButtonStyled appearance="secondary" onClick={() => props.onClose()}>
                Close
            </ButtonStyled>
        </ActionModalStyled>
    );
};

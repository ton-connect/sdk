import { Component, JSXElement, Show } from 'solid-js';
import { Translation } from 'src/app/components/typography/Translation';
import { ActionModalStyled, ButtonStyled, H1Styled, TextStyled } from './style';
import { Identifiable } from 'src/app/models/identifiable';

interface ActionModalProps extends Identifiable {
    headerTranslationKey: string;
    icon: JSXElement;
    textTranslationKey?: string;
    onClose: () => void;
    showButton?: boolean;
}

export const ActionModal: Component<ActionModalProps> = props => {
    return (
        <ActionModalStyled id={props.id}>
            {props.icon}
            <H1Styled translationKey={props.headerTranslationKey} />
            <TextStyled translationKey={props.textTranslationKey} />
            <Show when={props.showButton !== false}>
                <ButtonStyled onClick={() => props.onClose()}>
                    <Translation translationKey="common.close">Close</Translation>
                </ButtonStyled>
            </Show>
        </ActionModalStyled>
    );
};

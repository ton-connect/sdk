import { Component, JSXElement, Show } from 'solid-js';
import { Translation } from 'src/app/components/typography/Translation';
import { ActionModalStyled, ButtonStyled, H1Styled, TextStyled } from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';

interface ActionModalProps extends WithDataAttributes {
    headerTranslationKey: string;
    icon: JSXElement;
    textTranslationKey?: string;
    onClose: () => void;
    showButton?: boolean;
}

export const ActionModal: Component<ActionModalProps> = props => {
    const dataAttrs = useDataAttributes(props);

    return (
        <ActionModalStyled {...dataAttrs()}>
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

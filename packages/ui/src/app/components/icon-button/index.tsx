import type { Property } from 'csstype';
import { Component, JSXElement, Match, Show, Switch } from 'solid-js';
import { ArrowIcon } from 'src/app/components/icons/arrow-icon';
import { CloseIcon } from 'src/app/components/icons/close-icon';
import { Styleable } from 'src/app/models/styleable';
import { IconButtonStyled } from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { QuestionIcon } from 'src/app/components';

export interface IconButtonProps extends Styleable, WithDataAttributes {
    fill?: Property.Color;
    children?: JSXElement;
    icon?: 'close' | 'arrow' | 'question' | JSXElement;
    onClick: () => void;
}

export const IconButton: Component<IconButtonProps> = props => {
    const dataAttrs = useDataAttributes(props);
    const icon = (): 'close' | 'arrow' | 'question' | JSXElement => props.icon || 'close';
    return (
        <IconButtonStyled
            class={props.class}
            onClick={() => props.onClick()}
            data-tc-icon-button="true"
            {...dataAttrs}
        >
            <Show when={!!props.children}>{props.children}</Show>
            <Show when={!props.children}>
                <Switch>
                    <Match when={icon() === 'close'}>
                        <CloseIcon fill={props.fill} />
                    </Match>
                    <Match when={icon() === 'arrow'}>
                        <ArrowIcon fill={props.fill} />
                    </Match>
                    <Match when={icon() === 'question'}>
                        <QuestionIcon fill={props.fill} />
                    </Match>
                    <Match when={typeof icon() !== 'string'}>{icon()}</Match>
                </Switch>
            </Show>
        </IconButtonStyled>
    );
};

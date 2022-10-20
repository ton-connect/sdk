import { Property } from 'csstype';
import { Component, JSXElement, Match, Show, Switch } from 'solid-js';
import { ArrowIcon } from 'src/app/components/icons/arrow-icon';
import { CloseIcon } from 'src/app/components/icons/close-icon';
import { Styleable } from 'src/app/models/styleable';
import { IconButtonStyled } from './style';

export interface IconButtonProps extends Styleable {
    fill?: Property.Color;
    children?: JSXElement;
    icon?: 'close' | 'arrow';
    onClick: () => void;
}

export const IconButton: Component<IconButtonProps> = props => {
    const icon = (): 'close' | 'arrow' => props.icon || 'close';
    return (
        <IconButtonStyled class={props.class} onClick={() => props.onClick()}>
            <Show when={!!props.children}>{props.children}</Show>
            <Show when={!props.children}>
                <Switch>
                    <Match when={icon() === 'close'}>
                        <CloseIcon fill={props.fill} />
                    </Match>
                    <Match when={icon() === 'arrow'}>
                        <ArrowIcon fill={props.fill} />
                    </Match>
                </Switch>
            </Show>
        </IconButtonStyled>
    );
};

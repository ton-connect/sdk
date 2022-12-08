import { Component, JSXElement, Show } from 'solid-js';
import { H3 } from 'src/app/components';
import { Styleable } from 'src/app/models/styleable';
import { Translateable } from 'src/app/models/translateable';
import { PropertyRequired } from 'src/app/utils/types';
import { NotificationStyled, TextStyled } from './style';

export interface NotificationProps extends Styleable {
    header: PropertyRequired<Translateable, 'translationKey'>;
    children?: string;
    text?: Translateable;
    icon?: JSXElement;
}

export const Notification: Component<NotificationProps> = props => {
    return (
        <NotificationStyled class={props.class}>
            <div>
                <H3
                    translationKey={props.header.translationKey}
                    translationValues={props.header.translationValues}
                >
                    {props.children}
                </H3>
                <Show when={props.text}>
                    <TextStyled
                        translationKey={props.text!.translationKey}
                        translationValues={props.text!.translationValues}
                    />
                </Show>
            </div>
            {props.icon}
        </NotificationStyled>
    );
};

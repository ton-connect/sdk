import { Component, JSXElement } from 'solid-js';
import { H3 } from 'src/app/components';
import { Styleable } from 'src/app/models/styleable';
import { NotificationStyled, TextStyled } from './style';

export interface NotificationProps extends Styleable {
    children: JSXElement;
    text?: JSXElement;
    icon?: JSXElement;
}

export const Notification: Component<NotificationProps> = props => {
    return (
        <NotificationStyled class={props.class}>
            <div>
                <H3>{props.children}</H3>
                <TextStyled>{props.text}</TextStyled>
            </div>
            {props.icon}
        </NotificationStyled>
    );
};

import { Component, JSXElement } from 'solid-js';
import { H3 } from 'src/app/components';
import { NotificationStyled, TextStyled } from './style';

interface NotificationProps {
    children: JSXElement;
    text?: JSXElement;
    icon?: JSXElement;
}

export const Notification: Component<NotificationProps> = props => {
    return (
        <NotificationStyled>
            <div>
                <H3>{props.children}</H3>
                <TextStyled>{props.text}</TextStyled>
            </div>
            {props.icon}
        </NotificationStyled>
    );
};

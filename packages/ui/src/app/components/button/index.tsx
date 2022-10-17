import { Component, JSXElement } from 'solid-js';
import { ButtonStyled } from 'src/app/components/button/style';

interface ButtonProps {
    appearance?: 'primary' | 'secondary';
    size?: 's' | 'm' | 'l';
    children: JSXElement;
    onClick: () => void;
}

export const Button: Component<ButtonProps> = props => {
    return <ButtonStyled onClick={props.onClick}>{props.children}</ButtonStyled>;
};

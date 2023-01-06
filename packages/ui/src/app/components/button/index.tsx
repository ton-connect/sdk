import { Component, JSXElement } from 'solid-js';
import { ButtonStyled } from 'src/app/components/button/style';
import { Styleable } from 'src/app/models/styleable';

export interface ButtonProps extends Styleable {
    children: JSXElement;
    onClick: () => void;
    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void) | undefined;
}

export const Button: Component<ButtonProps> = props => {
    return (
        <ButtonStyled
            class={props.class}
            onClick={() => props.onClick()}
            ref={props.ref}
        >
            {props.children}
        </ButtonStyled>
    );
};

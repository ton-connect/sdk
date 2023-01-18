import { Component, JSXElement } from 'solid-js';
import { ButtonStyled } from 'src/app/components/button/style';
import { Styleable } from 'src/app/models/styleable';
import { Identifiable } from 'src/app/models/identifiable';

export interface ButtonProps extends Styleable, Identifiable {
    children: JSXElement;
    onClick?: () => void;
    disabled?: boolean;
    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void) | undefined;
}

export const Button: Component<ButtonProps> = props => {
    return (
        <ButtonStyled
            class={props.class}
            id={props.id}
            onClick={() => props.onClick?.()}
            ref={props.ref}
            disabled={props.disabled}
        >
            {props.children}
        </ButtonStyled>
    );
};

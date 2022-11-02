import { Component, JSXElement } from 'solid-js';
import { ButtonStyled } from 'src/app/components/button/style';
import { Styleable } from 'src/app/models/styleable';

export interface ButtonProps extends Styleable {
    appearance?: 'primary' | 'secondary';
    size?: 's' | 'm' | 'l';
    children: JSXElement;
    onClick: () => void;
}

export const Button: Component<ButtonProps> = props => {
    const appearance = (): 'primary' | 'secondary' => props.appearance || 'primary';
    return (
        <ButtonStyled class={props.class} appearance={appearance()} onClick={() => props.onClick()}>
            {props.children}
        </ButtonStyled>
    );
};

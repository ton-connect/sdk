import { Component, JSXElement } from 'solid-js';
import { ButtonStyled } from 'src/app/components/button/style';
import { Styleable } from 'src/app/models/styleable';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';

export interface ButtonProps extends Styleable, WithDataAttributes {
    appearance?: 'primary' | 'flat' | 'secondary';
    scale?: 's' | 'm';
    leftIcon?: JSXElement;
    rightIcon?: JSXElement;
    iconFloatRight?: boolean;
    children: JSXElement;
    onClick?: (e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => void;
    onMouseEnter?: (e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => void;
    onMouseLeave?: (e: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => void;
    disabled?: boolean;
    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void) | undefined;
}

export const Button: Component<ButtonProps> = props => {
    const dataAttrs = useDataAttributes(props);

    return (
        <ButtonStyled
            appearance={props.appearance || 'primary'}
            class={props.class}
            onClick={e => props.onClick?.(e)}
            onMouseEnter={e => props.onMouseEnter?.(e)}
            onMouseLeave={e => props.onMouseLeave?.(e)}
            ref={props.ref}
            disabled={props.disabled}
            scale={props.scale || 'm'}
            leftIcon={!!props.leftIcon}
            rightIcon={!!props.rightIcon}
            data-tc-button="true"
            {...dataAttrs}
        >
            {props.leftIcon}
            {props.children}
            {props.rightIcon}
        </ButtonStyled>
    );
};

import { Component, JSXElement } from 'solid-js';
import { AStyled } from './style';
import { Styleable } from 'src/app/models/styleable';

export interface LinkProps extends Styleable {
    children: JSXElement;

    href: string;

    blank?: boolean;
}

export const Link: Component<LinkProps> = props => {
    const attributes = (): { rel: 'noreferrer noopener' } | {} =>
        props.blank ? { rel: 'noreferrer noopener' } : {};

    return (
        <AStyled
            href={props.href}
            target={props.blank ? '_blank' : '_self'}
            class={props.class}
            {...attributes}
        >
            {props.children}
        </AStyled>
    );
};

import { Component, JSXElement } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { H2Styled } from './style';

export interface H2Props extends Styleable {
    children: JSXElement;
}

export const H2: Component<H2Props> = props => {
    return <H2Styled class={props.class}>{props.children}</H2Styled>;
};

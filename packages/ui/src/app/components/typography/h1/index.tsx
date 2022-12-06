import { Component, JSXElement } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { H1Styled } from './style';

export interface H1Props extends Styleable {
    children: JSXElement;
}

export const H1: Component<H1Props> = props => {
    return <H1Styled class={props.class}>{props.children}</H1Styled>;
};

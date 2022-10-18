import { Component, JSXElement } from 'solid-js';
import { H1Styled } from './style';

interface H1Props {
    children: JSXElement;
}

export const H1: Component<H1Props> = props => {
    return <H1Styled>{props.children}</H1Styled>;
};

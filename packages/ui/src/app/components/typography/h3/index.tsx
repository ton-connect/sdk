import { Component, JSXElement } from 'solid-js';
import { H3Styled } from './style';

interface H2Props {
    children: JSXElement;
}

export const H3: Component<H2Props> = props => {
    return <H3Styled>{props.children}</H3Styled>;
};

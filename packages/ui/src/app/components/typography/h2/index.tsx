import { Component, JSXElement } from 'solid-js';
import { H2Styled } from './style';

interface H2Props {
    children: JSXElement;
}

export const H2: Component<H2Props> = props => {
    return <H2Styled>{props.children}</H2Styled>;
};

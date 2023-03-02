import { useI18n } from '@solid-primitives/i18n';
import { Component, JSXElement } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { Translateable } from 'src/app/models/translateable';
import { H1Styled } from './style';

export interface H1Props extends Styleable, Translateable {
    children?: JSXElement;
}

export const H1: Component<H1Props> = props => {
    const [t] = useI18n();
    return (
        <H1Styled class={props.class} data-tc-h1="true">
            {props.translationKey
                ? t(props.translationKey, props.translationValues, props.children?.toString())
                : props.children}
        </H1Styled>
    );
};

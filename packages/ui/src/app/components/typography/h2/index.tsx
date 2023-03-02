import { useI18n } from '@solid-primitives/i18n';
import { Component, JSXElement } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { Translateable } from 'src/app/models/translateable';
import { H2Styled } from './style';

export interface H2Props extends Styleable, Translateable {
    children?: JSXElement;
}

export const H2: Component<H2Props> = props => {
    const [t] = useI18n();
    return (
        <H2Styled class={props.class} data-tc-h2="true">
            {props.translationKey
                ? t(props.translationKey, props.translationValues, props.children?.toString())
                : props.children}
        </H2Styled>
    );
};

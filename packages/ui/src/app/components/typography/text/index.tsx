import { useI18n } from '@solid-primitives/i18n';
import type { Property } from 'csstype';
import { Component, createEffect, JSXElement, mergeProps } from 'solid-js';
import { useTheme } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';
import { Translateable } from 'src/app/models/translateable';
import { TextStyled } from './style';

export interface TextProps extends Styleable, Translateable {
    children?: JSXElement;
    fontSize?: Property.FontSize;
    fontWeight?: Property.FontWeight;
    lineHeight?: Property.LineHeight;
    letterSpacing?: Property.LetterSpacing;
    color?: Property.Color;

    cursor?: 'default' | 'unset';
}

export const Text: Component<TextProps> = inputs => {
    const theme = useTheme();
    const [t] = useI18n();
    let textRef: HTMLDivElement | undefined;

    const color = (): Property.Color => inputs.color || theme.colors.text.primary;

    const props = mergeProps(
        {
            fontSize: '14px',
            fontWeight: '510',
            lineHeight: '130%'
        },
        inputs
    );

    createEffect(() => {
        if (!textRef) {
            return;
        }

        if (props.cursor === 'unset') {
            return;
        }

        if (getComputedStyle(textRef).cursor !== 'pointer') {
            textRef.style.cursor = 'default';
        }
    });

    return (
        <TextStyled
            fontSize={props.fontSize}
            fontWeight={props.fontWeight}
            lineHeight={props.lineHeight}
            color={color()}
            class={props.class}
            ref={textRef}
            data-tc-text="true"
        >
            {props.translationKey
                ? t(props.translationKey, props.translationValues, props.children?.toString())
                : props.children}
        </TextStyled>
    );
};

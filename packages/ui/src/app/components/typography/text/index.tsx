import { Property } from 'csstype';
import { Component, JSXElement, mergeProps } from 'solid-js';
import { useTheme } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';
import { TextStyled } from './style';

export interface TextProps extends Styleable {
    children: JSXElement;
    fontSize?: Property.FontSize;
    fontWeight?: Property.FontWeight;
    lineHeight?: Property.LineHeight;
    letterSpacing?: Property.LetterSpacing;
    color?: Property.Color;
}

export const Text: Component<TextProps> = inputs => {
    const theme = useTheme();

    const color = (): Property.Color => inputs.color || theme.colors.font.primary;

    const props = mergeProps(
        {
            fontSize: '14px',
            fontWeight: '510',
            lineHeight: '130%',
            letterSpacing: '-0.154px'
        },
        inputs
    );
    return (
        <TextStyled
            fontSize={props.fontSize}
            fontWeight={props.fontWeight}
            lineHeight={props.lineHeight}
            letterSpacing={props.letterSpacing}
            color={color()}
            class={props.class}
        >
            {props.children}
        </TextStyled>
    );
};

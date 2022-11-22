import { Property } from 'csstype';
import { styled } from 'solid-styled-components';

export const TextStyled = styled.div<{
    fontSize: Property.FontSize;
    fontWeight: Property.FontWeight;
    letterSpacing: Property.LetterSpacing;
    lineHeight: Property.LineHeight;
    color: Property.Color;
}>`
    font-style: normal;
    font-weight: ${props => props.fontWeight};
    font-size: ${props => props.fontSize};
    line-height: ${props => props.lineHeight};
    letter-spacing: ${props => props.letterSpacing};

    color: ${props => props.color};
`;

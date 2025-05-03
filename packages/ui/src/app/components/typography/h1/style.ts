import { styled } from 'solid-styled-components';

export const H1Styled = styled.h1`
    font-style: normal;
    font-weight: 590;
    font-size: 20px;
    line-height: 28px;

    text-align: center;

    color: ${props => props.theme!.colors.text.primary};

    margin-top: 0;
    margin-bottom: 0;

    cursor: default;
`;

import { styled } from 'solid-styled-components';

export const H1Styled = styled.h1`
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    line-height: 28px;
    letter-spacing: -0.35px;
    text-wrap: balance;

    text-align: center;

    color: ${props => props.theme!.colors.text.primary};

    margin-top: 0;
    margin-bottom: 0;

    cursor: default;
`;

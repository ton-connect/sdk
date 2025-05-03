import { styled } from 'solid-styled-components';

export const H2Styled = styled.h2`
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;

    text-align: center;

    color: ${props => props.theme!.colors.text.secondary};

    margin-top: 0;
    margin-bottom: 32px;

    cursor: default;
`;

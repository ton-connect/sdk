import { styled } from 'solid-styled-components';

export const ButtonStyled = styled.button<{ appearance: 'primary' | 'secondary' | 'flat' }>`
    background-color: ${props =>
        props.appearance === 'flat'
            ? props.theme!.colors.backgroundPrimary
            : props.theme!.colors[props.appearance]};
    color: ${props =>
        props.appearance === 'primary'
            ? 'white'
            : props.appearance === 'flat'
            ? props.theme!.colors.font.primary
            : props.theme!.colors.font.accent};

    box-shadow: ${props =>
        props.appearance === 'flat' ? '0 4px 24px rgba(0, 0, 0, 0.16);' : 'unset;'}
  
    padding: 9px 16px;
    border: none;
    border-radius: 16px;
    cursor: pointer;

    font-size: 14px;
    font-weight: 590;
    line-height: 18px;
    letter-spacing: -0.154px;
  
    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: scale(1.04);
    }

    &:active {
        transform: scale(0.96);
    }
`;

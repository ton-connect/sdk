import { styled } from 'solid-styled-components';

export const ButtonStyled = styled.button<{ appearance: 'primary' | 'secondary' }>`
    background-color: ${props => props.theme!.colors[props.appearance]};
    color: ${props => (props.appearance === 'primary' ? 'white' : props.theme!.colors.primary)};
    padding: 9px 16px;
    border: none;
    border-radius: 16px;
    cursor: pointer;

    transition: transform 0.15s ease-in-out;

    &:hover {
        transform: scale(1.03);
    }

    &:active {
        transform: scale(0.95);
    }
`;

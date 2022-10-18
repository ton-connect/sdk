import { styled } from 'solid-styled-components';

export const IconButtonStyled = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${props => props.theme!.colors.transparentSecondary};
    border: none;
    cursor: pointer;

    transition: transform 0.15s ease-in-out;

    &:hover {
        transform: scale(1.03);
    }

    &:active {
        transform: scale(0.95);
    }
`;

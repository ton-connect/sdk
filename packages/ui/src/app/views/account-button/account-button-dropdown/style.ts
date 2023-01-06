import { styled } from 'solid-styled-components';

export const AccountButtonDropdownStyled = styled.div`
    width: 256px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: 16px;

    background-color: ${props => props.theme!.colors.background.primary}
           
    color: ${props => props.theme!.colors.text.primary}
`;

export const UlStyled = styled.ul`
    background-color: ${props => props.theme!.colors.background.primary};
    padding: 8px;
`;

export const MenuButtonStyled = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    width: 100%;

    background-color: ${props => props.theme!.colors.background.primary};
    border: none;
    border-radius: 8px;
    cursor: pointer;

    transition: background-color, transform 0.1s ease-in-out;

    &:hover {
        background-color: ${props => props.theme!.colors.background.secondary};
    }

    &:active {
        transform: scale(0.96);
    }
`;

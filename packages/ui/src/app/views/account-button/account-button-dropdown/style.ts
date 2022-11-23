import { styled } from 'solid-styled-components';

export const AccountButtonDropdownStyled = styled.div`
    width: 256px;
    padding: 8px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: 16px;

    background-color: ${props => props.theme!.colors.backgroundPrimary}
           
    color: ${props => props.theme!.colors.font.primary}
`;

export const MenuButtonStyled = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    width: 100%;

    background-color: ${props => props.theme!.colors.backgroundPrimary};
    border: none;
    border-radius: 8px;
    cursor: pointer;

    transition: background-color 0.1s ease-in-out;

    &:hover {
        background-color: ${props => props.theme!.colors.backgroundSecondary};
    }

    /*&:active {
        transform: scale(0.96);
    }*/
`;

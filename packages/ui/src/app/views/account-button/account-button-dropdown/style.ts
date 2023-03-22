import { styled } from 'solid-styled-components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const hoverBorders: BorderRadiusConfig = {
    m: '8px',
    s: '4px',
    none: '0'
};

const dropdownBorders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const AccountButtonDropdownStyled = styled.div`
    width: 256px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: ${props => dropdownBorders[props.theme!.borderRadius]};

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
    height: 40px;
    padding-left: 8px;
    width: 100%;

    background-color: ${props => props.theme!.colors.background.primary};
    border: none;
    border-radius: ${props => hoverBorders[props.theme!.borderRadius]};
    cursor: pointer;

    transition: background-color, transform 0.1s ease-in-out;

    &:hover {
        background-color: ${props => props.theme!.colors.background.secondary};
    }

    &:active {
        transform: scale(0.96);
    }
`;

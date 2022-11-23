import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { AccountButtonDropdown } from 'src/app/views/account-button/account-button-dropdown';

export const AccountButtonStyled = styled(Button)`
    display: flex;
    align-items: center;
    gap: 9px;

    transition: background-color 0.1s ease-in-out;

    &:hover:not(:active) {
        transform: scale(1);
    }

    &:hover {
        background-color: ${props => props.theme!.colors.backgroundSecondary};
    }
`;

export const DropdownContainerStyled = styled.div`
    width: 256px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

export const DropdownStyled = styled(AccountButtonDropdown)<{ hidden: boolean }>`
    box-sizing: border-box;
    overflow: hidden;
    margin-top: 20px;

    transform: ${props => (props.hidden ? 'unset' : 'translateY(-8px)')};
    opacity: ${props => (props.hidden ? '0' : '1')};
    max-height: ${props => (props.hidden ? '0' : '140px')};
    transition: ${props =>
        `max-height 0s ${
            props.hidden ? '0.15s' : '0s'
        }, transform 0.15s ease-in-out, opacity 0.15s ease-in-out`};
`;

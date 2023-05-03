import { styled } from 'solid-styled-components';
import { Button, LoaderIcon } from 'src/app/components';
import { rgba } from 'src/app/utils/css';
import { AccountButtonDropdown } from 'src/app/views/account-button/account-button-dropdown';
import { Notifications } from 'src/app/views/account-button/notifications';

export const AccountButtonStyled = styled(Button)`
    background-color: ${props => props.theme!.colors.connectButton.background};
    color: ${props => props.theme!.colors.connectButton.foreground};
    box-shadow: ${props => `0 4px 24px ${rgba(props.theme!.colors.constant.black, 0.16)}`};
    padding: 8px 16px 8px 12px;

    display: flex;
    align-items: center;
    gap: 4px;
    height: 40px;
`;

export const DropdownButtonStyled = styled(AccountButtonStyled)`
    padding: 12px 16px;
    min-width: 148px;
    justify-content: center;
    background-color: ${props => props.theme!.colors.background.primary};
`;

export const LoaderButtonStyled = styled(Button)`
    min-width: 148px;
    height: 40px;

    background-color: ${props => props.theme!.colors.background.primary};
    color: ${props => props.theme!.colors.connectButton.foreground};
    box-shadow: ${props => `0 4px 24px ${rgba(props.theme!.colors.constant.black, 0.16)}`};

    display: flex;
    align-items: center;
    justify-content: center;
`;
export const LoaderIconStyled = styled(LoaderIcon)`
    height: 18px;
    width: 18px;
`;

export const DropdownContainerStyled = styled.div`
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

export const DropdownStyled = styled(AccountButtonDropdown)<{ hidden: boolean }>`
    box-sizing: border-box;
    overflow: hidden;
    margin-top: 12px;
`;

export const NotificationsStyled = styled(Notifications)`
    > div:first-child {
        margin-top: 20px;
    }
`;

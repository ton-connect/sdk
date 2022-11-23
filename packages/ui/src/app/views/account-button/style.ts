import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { AccountButtonDropdown } from 'src/app/views/account-button/account-button-dropdown';

export const AccountButtonStyled = styled(Button)`
    display: flex;
    align-items: center;
    gap: 9px;
`;

export const DropdownContainerStyled = styled.div`
    width: 256px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

export const DropdownStyled = styled(AccountButtonDropdown)<{ hidden: boolean }>`
    display: ${props => (props.hidden ? 'none' : 'block')};
    margin-top: 12px;
`;

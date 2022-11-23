import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { AccountButtonDropdown } from 'src/app/views/account-button/account-button-dropdown';

export const AccountButtonStyled = styled(Button)`
    display: flex;
    align-items: center;
    gap: 9px;

    &:hover:not(:active) {
        transform: scale(1);
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
    margin-top: 12px;
    overflow: hidden;

    max-height: ${props => (props.hidden ? 0 : '128px')};
    transition: max-height 0.3s ease-in-out;
`;

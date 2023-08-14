import { styled } from 'solid-styled-components';
import { Button, H1, IconButton, WalletLabeledItem } from 'src/app/components';

export const DesktopSelectWalletModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const H1Styled = styled(H1)`
    margin-bottom: 18px;
`;

export const ScrollDivider = styled.div<{ isShown: boolean }>`
    height: 1px;
    margin: 0 -24px;
    width: calc(100% + 48px);
    opacity: 0.12;
    background: ${props => (props.isShown ? props.theme!.colors.icon.secondary : 'transparent')};
    transition: background 0.15s ease-in-out;
`;

export const WalletsUl = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, 92px);
    justify-content: center;
    row-gap: 8px;
    overflow-y: auto;
    max-height: 510px;
    width: calc(100% + 12px);
    padding: 0 0 16px;
    align-self: flex-start;

    scrollbar-width: none;
    &&::-webkit-scrollbar {
        display: none;
    }

    &&::-webkit-scrollbar-track {
        background: transparent;
    }

    &&::-webkit-scrollbar-thumb {
        display: none;
    }
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto 1px;
    font-size: 15px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const WalletLabeledItemStyled = styled(WalletLabeledItem)`
    height: 100%;
`;

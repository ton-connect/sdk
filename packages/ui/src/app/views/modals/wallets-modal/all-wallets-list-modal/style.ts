import { styled } from 'solid-styled-components';
import { Button, H1, H2, IconButton, WalletLabeledItem } from 'src/app/components';
import { media } from 'src/app/styles/media';

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

    ${media('mobile')} {
        width: 100%;
    }
`;

export const WalletsUl = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, 92px);
    grid-template-rows: auto;
    align-content: flex-start;
    row-gap: 8px;
    width: 100%;
    padding: 0 0 16px;
    align-self: flex-start;
    max-width: 400px;
    margin: 0 auto;
    list-style: none;

    > li {
        display: block;
        height: fit-content;
    }

    ${media('mobile')} {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0;
        padding: 8px 12px 16px;
        max-width: none;

        > li {
            min-width: 78px;
            display: flex;
        }

        > li > * {
            width: 100%;
        }
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

export const WalletLabeledItemStyled = styled(WalletLabeledItem)<{ withOpacity?: boolean }>`
    opacity: ${props => (props.withOpacity ? '0.4' : '1')};
`;

export const WalletsNotSupportedNotifier = styled.div`
    display: grid;
    grid-template-columns: auto 28px;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 16px;
    color: ${props => props.theme!.colors.text.secondary};
    background: ${props => props.theme!.colors.background.tint};

    ${media('mobile')} {
        margin-left: 16px;
        margin-right: 16px;
    }
`;

export const WalletsNotSupportedNotifierText = styled(H2)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: left;
    margin: 0;
`;

export const ErrorBoxStyled = styled.div`
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translate(-50%, 0);

    text-wrap: nowrap;
    display: flex;
    gap: 6px;
    align-items: center;
    border-radius: 18px;
    min-width: 126px;
    padding: 9px 16px 9px 10px;

    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.08));
    background-color: ${props => props.theme!.colors.background.segment};
`;

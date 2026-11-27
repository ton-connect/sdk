import { sheetIconButton } from 'src/app/components/icon-button/style';
import { styled } from 'solid-styled-components';
import {
    ConnectButton,
    Diamond,
    H1,
    H2,
    IconButton,
    Image,
    TelegramConnectButton
} from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { plainFill } from 'src/app/components/button/style';
import { WalletImage } from 'src/app/components/wallet-item/wallet-image';
import { mixColor } from 'src/app/utils/css';
import { THEME } from 'src/models/THEME';
import { EASE_STANDARD } from 'src/app/styles/motion';

/** Both connect buttons span the modal, inset from its edges. */
const fullWidth = `
    margin-left: 20px;
    margin-right: 20px;
    width: calc(100% - 40px);

    @media (max-width: 375px) {
        margin-left: 16px;
        margin-right: 16px;
        width: calc(100% - 32px);
    }
`;

const toggleBorders: BorderRadiusConfig = {
    m: '22px',
    s: '12px',
    none: '0'
};

export const H1Styled = styled(H1)`
    margin-top: 38px;
    margin-bottom: 4px;
    padding: 0 24px;
`;

export const TelegramDiamondStyled = styled(Diamond)`
    margin: 0 auto 4px;
    filter: drop-shadow(0 8px 28px rgba(40, 120, 255, 0.45));
`;

/** Title of the Telegram-first screen, which has the diamond above it and no subtitle under it. */
export const TelegramH1Styled = styled(H1)`
    margin-top: 0;
    margin-bottom: 22px;
    padding: 0 24px;
    font-size: 22px;
    line-height: 28px;
    letter-spacing: -0.35px;
`;

export const H2Styled = styled(H2)<{
    maxWidth?: number;
    padding?: string;
    margin?: string;
}>`
    margin: ${props => props.margin ?? '0 0 28px 0'};
    padding: ${props => props.padding ?? '0 24px'};
    max-width: ${props => props.maxWidth}px;
    margin-left: ${props => (props.maxWidth ? 'auto' : '0px')};
    margin-right: ${props => (props.maxWidth ? 'auto' : '0px')};
    font-size: 14px;
    line-height: 18px;
`;

export const TelegramButtonStyled = styled(TelegramConnectButton)`
    ${fullWidth}
    margin-bottom: 10px;
`;

const iconBorders: BorderRadiusConfig = {
    m: '6px',
    s: '6px',
    none: '0'
};

/**
 * Gram Wallet's own button under Telegram's, with `withSecondaryButton`: the neutral pill of the
 * modal's secondary buttons, or no fill at all when the wallets registry asks for a transparent one.
 * Without the Telegram button it follows the title directly, and keeps the 22px the Telegram button
 * would leave under it.
 */
export const GramWalletButtonStyled = styled(ConnectButton)<{
    transparent?: boolean;
    afterTitle?: boolean;
}>`
    ${fullWidth}
    margin-top: ${props => (props.afterTitle ? '18px' : '0')};
    ${props => (props.transparent ? 'background: transparent;' : plainFill(props.theme!))}
    color: ${props => props.theme!.colors.text.primary};
`;

export const ButtonWalletIconStyled = styled(Image)`
    width: 24px;
    height: 24px;
    border-radius: ${props => iconBorders[props.theme!.borderRadius]};
`;

export const StyledLeftActionButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
    ${sheetIconButton}
`;

/** With `isCompact`, the button under the promoted buttons that folds the wallets row away and back. */
export const OtherWalletsToggleStyled = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    margin: 22px auto 10px;
    padding: 0 16px 0 18px;
    border-radius: ${props => toggleBorders[props.theme!.borderRadius]};
    ${props => plainFill(props.theme!)}
    color: ${props => props.theme!.colors.text.primary};
    font-size: 15px;
    font-weight: 500;
    line-height: 20px;
    cursor: pointer;
`;

/**
 * The first wallets of the row as a stack of icons before the toggle's label, the first one in
 * front and the next ones tucked behind it in row order, each 2px smaller than the one before it (20,
 * 18 and 16px). The front icon sits 18px from the toggle's left edge, where the label starts once
 * the wallets are unfolded below and the stack fades and folds away. The 2px padding keeps the
 * icons' rings clear of the clipping, and the negative margins take it back out of the layout.
 */
export const ToggleWalletsStyled = styled.span<{ open: boolean }>`
    display: flex;
    align-items: center;
    isolation: isolate;
    overflow: hidden;
    padding: 2px;
    margin: -2px ${props => (props.open ? '-8px' : '0')} -2px -2px;
    max-width: ${props => (props.open ? '0' : '56px')};
    opacity: ${props => (props.open ? 0 : 1)};
    transition:
        max-width 0.42s ${EASE_STANDARD},
        margin 0.42s ${EASE_STANDARD},
        opacity 0.24s ${EASE_STANDARD};

    & > * {
        flex-shrink: 0;
    }

    & > * + * {
        margin-left: -10px;
    }

    & > :nth-child(1) {
        z-index: 3;
    }

    & > :nth-child(2) {
        z-index: 2;
        width: 18px;
        height: 18px;
        border-radius: 5.5px;
    }

    & > :nth-child(3) {
        width: 16px;
        height: 16px;
        border-radius: 5px;
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

/**
 * One icon of the stack, ringed in the colour of the pill under it so each icon stands clear of the
 * one it covers.
 */
export const ToggleWalletImageStyled = styled(WalletImage)`
    width: 20px;
    height: 20px;
    border-radius: 6px;
    box-shadow: 0 0 0 2px
        ${props =>
            props.theme!.theme === THEME.DARK
                ? mixColor(
                      props.theme!.colors.background.tint,
                      props.theme!.colors.icon.secondary,
                      0.14
                  )
                : '#FFFFFF'};
`;

/** A small chevron beside the toggle's label that turns over as the wallets unfold. */
export const ToggleChevronStyled = styled.span<{ open: boolean }>`
    display: flex;

    & > svg {
        width: 12px;
        height: 12px;
    }

    transition: transform 0.42s ${EASE_STANDARD};
    transform: rotate(${props => (props.open ? '180deg' : '0deg')});

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

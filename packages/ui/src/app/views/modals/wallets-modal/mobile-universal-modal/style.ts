import { styled } from 'solid-styled-components';
import {
    Button,
    ConnectButton,
    Diamond,
    H1,
    H2,
    IconButton,
    Image,
    TelegramConnectButton
} from 'src/app/components';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

/** Both connect buttons span the modal, inset from its edges. */
const fullWidth = `
    margin-left: 28px;
    margin-right: 28px;
    width: calc(100% - 56px);

    @media (max-width: 375px) {
        margin-left: 16px;
        margin-right: 16px;
        width: calc(100% - 32px);
    }
`;

const iconBorders: BorderRadiusConfig = {
    m: '6px',
    s: '6px',
    none: '0'
};

export const OtherOptionButton = styled.li`
    width: 82px;
    min-width: 82px;
    height: 124px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;

    text-align: center;
    cursor: pointer;

    transition: transform 0.1s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;

export const H1Styled = styled(H1)`
    margin-top: 38px;
    margin-bottom: 4px;
    padding: 0 24px;
`;

export const TelegramDiamondStyled = styled(Diamond)`
    margin: 0 auto 4px;
`;

/** Title of the Telegram-first screen, which has the diamond above it and no subtitle under it. */
export const TelegramH1Styled = styled(H1)`
    margin-top: 0;
    margin-bottom: 20px;
    padding: 0 24px;
`;

export const H2Styled = styled(H2)<{
    maxWidth?: number;
    minHeight?: string;
    padding?: string;
    margin?: string;
}>`
    margin: ${props => props.margin ?? '0 0 28px 0'};
    padding: ${props => props.padding ?? '0 24px'};
    min-height: ${props => props.padding ?? '44px'};
    max-width: ${props => props.maxWidth}px;
    margin-left: ${props => (props.maxWidth ? 'auto' : '0px')};
    margin-right: ${props => (props.maxWidth ? 'auto' : '0px')};
`;

const ROW_FOLD_DURATION = '0.25s';
const ROW_FOLD_TRANSITION = `${ROW_FOLD_DURATION} ease-out`;

/**
 * Room the row toggle adds above its text, for a taller tap target. The heading's negative top
 * margin takes it back out of the gap under the button above, so the text sits where the plain
 * heading's text does.
 */
const ROW_TOGGLE_TOP_INSET = '11px';

/** The row heading of `isCompact`, which holds the toggle as an accordion heading does. */
export const RowToggleHeadingStyled = styled(H2)`
    display: flex;
    justify-content: center;
    max-width: 342px;
    margin: -${ROW_TOGGLE_TOP_INSET} auto 0;
    padding: 0;
`;

/** Reads as the heading it replaces; only the chevron after the text tells it apart. */
export const RowToggleStyled = styled.button`
    padding: ${ROW_TOGGLE_TOP_INSET} 24px 8px;
    border: none;
    background: none;
    cursor: pointer;

    font: inherit;
    color: inherit;
    text-align: inherit;
`;

/** Keeps the chevron on the line of the label's last word when the label wraps. */
export const RowToggleTailStyled = styled.span`
    white-space: nowrap;
`;

/** Points to the right while the row is folded, and down while it is open. */
export const RowToggleChevronStyled = styled.span<{ expanded: boolean }>`
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: 2px;
    vertical-align: middle;
    transform: rotate(${props => (props.expanded ? '90deg' : '0deg')});
    transition: transform ${ROW_FOLD_TRANSITION};

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }

    > svg {
        display: block;
    }
`;

/**
 * Folds the row to no height at all. Grid rows can animate to and from the row's own height,
 * which `height` cannot. While folded, the row is hidden, so its tiles can neither be focused nor
 * reached by assistive technology; when it folds, it is only hidden once the animation ends.
 * The bottom padding keeps the folded toggle off the modal footer, as the open row's own padding
 * does. A margin would collapse out of the modal body and show in the footer's colour.
 */
export const WalletsRowFoldStyled = styled.div<{ expanded: boolean }>`
    display: grid;
    grid-template-rows: ${props => (props.expanded ? '1fr' : '0fr')};
    padding-bottom: ${props => (props.expanded ? '0' : '16px')};
    visibility: ${props => (props.expanded ? 'visible' : 'hidden')};
    transition:
        grid-template-rows ${ROW_FOLD_TRANSITION},
        padding-bottom ${ROW_FOLD_TRANSITION},
        visibility 0s ${props => (props.expanded ? '0s' : ROW_FOLD_DURATION)};

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }

    > div {
        min-height: 0;
        overflow: hidden;
    }
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;

/**
 * Stacks 12px above the Gram Wallet button. Without that button under it, it keeps the 24px the
 * Gram Wallet button would leave before the row heading.
 */
export const TelegramButtonStyled = styled(TelegramConnectButton)<{ followedByButton?: boolean }>`
    ${fullWidth}
    margin-bottom: ${props => (props.followedByButton ? '12px' : '24px')};
`;

export const GramWalletButtonStyled = styled(ConnectButton)<{ transparent?: boolean }>`
    ${fullWidth}
    margin-bottom: 24px;
    background-color: ${props =>
        props.transparent ? 'transparent' : props.theme!.colors.background.tint};
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
`;

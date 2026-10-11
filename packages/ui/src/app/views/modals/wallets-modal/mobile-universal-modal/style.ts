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

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;

export const TelegramButtonStyled = styled(TelegramConnectButton)`
    ${fullWidth}
    margin-bottom: 12px;
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

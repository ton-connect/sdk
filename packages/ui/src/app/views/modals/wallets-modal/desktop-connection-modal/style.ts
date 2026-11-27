import { styled } from 'solid-styled-components';
import {
    Button,
    ErrorIcon,
    H1,
    H2,
    IconButton,
    LoaderIcon,
    QRCode,
    TelegramConnectButton
} from 'src/app/components';

export const DesktopConnectionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
`;

export const BodyStyled = styled.div<{ qr: boolean }>`
    flex: 1;
    margin-top: ${props => (props.qr ? '24px' : '18px')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;

/** What the body shows for the chosen way to connect, centred in it as the body centres its content. */
export const ModeStyled = styled.div`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const QRCodeStyled = styled(QRCode)`
    margin-bottom: 14px;
`;

export const H1Styled = styled(H1)`
    max-width: 288px;
    margin: 0 auto 2px;
`;

/**
 * The caption under the QR code, as on the phone: what to scan it with. It takes the body's full
 * width, so the longer instruction with the wallet's name fits on two lines.
 */
export const H2Styled = styled(H2)`
    max-width: 304px;
    text-align: center;
    margin: 0 auto 24px;
    font-size: 13px;
    line-height: 17px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 16px;
`;

export const BottomButtonsContainerStyled = styled(ButtonsContainerStyled)`
    padding-bottom: 0;
`;

export const FooterButton = styled(Button)`
    margin-bottom: 24px;
`;

/**
 * The only footer chip under the QR, drawn as the mobile screen's "Connect Telegram" button. It
 * hugs its label, no wider than the QR card above it, and keeps the chips' gap below it.
 *
 * A long wallet name can wrap the label to two lines, and the button grows to fit them. The icon
 * then flows with the text, so it stays next to the first word instead of alone at the edge, and
 * both lines stay centred.
 */
export const AccentFooterButton = styled(TelegramConnectButton)<{ lowerIcon?: boolean }>`
    width: auto;
    max-width: 336px;
    padding: 8px 16px;
    margin-bottom: 24px;

    & > span {
        display: block;
        text-align: center;
        text-wrap: balance;
    }

    & > span > svg {
        display: inline-block;
        vertical-align: top;
        /* Centred on the letters of the label's 22px line. lowerIcon takes an icon whose glyph
           leaves more room below it than above, the laptop, 1px further down, so that its base
           stands on the text baseline. */
        margin: ${props => (props.lowerIcon ? '3px' : '2px')} 8px 0 0;
    }
`;

export const LoaderStyled = styled(LoaderIcon)`
    margin-bottom: 18px;
    margin-top: 2px;
`;

export const ErrorIconStyled = styled(ErrorIcon)`
    margin-bottom: 16px;
`;

export const BodyTextStyled = styled(H2)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;

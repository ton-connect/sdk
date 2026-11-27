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
    margin-top: ${props => (props.qr ? '0' : '18px')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;

export const QRCodeStyled = styled(QRCode)`
    margin-bottom: 24px;
`;

export const H1Styled = styled(H1)`
    max-width: 288px;
    margin: 0 auto 2px;
`;

export const H2Styled = styled(H2)`
    max-width: 288px;
    text-align: center;
    margin: 0 auto 20px;
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
 * hugs its label instead of spanning the modal, and keeps the chips' gap below it.
 *
 * A long wallet name can wrap the label to two lines, which the button's height fits. The icon
 * then flows with the text, so it stays next to the first word instead of alone at the edge, and
 * both lines stay centred.
 */
export const AccentFooterButton = styled(TelegramConnectButton)<{ lowerIcon?: boolean }>`
    width: auto;
    padding: 0 24px;
    margin-bottom: 24px;

    & > span {
        display: block;
        text-align: center;
        text-wrap: balance;
    }

    & > span > svg {
        display: inline-block;
        vertical-align: top;
        /* Centred in the 20px line. lowerIcon takes an icon whose glyph leaves more room below it
           than above, the laptop, 1px further down, so that its base sits on the text baseline. */
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

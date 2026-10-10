import { styled } from 'solid-styled-components';
import { Button, ErrorIcon, H1, H2, IconButton, LoaderIcon, QRCode } from 'src/app/components';

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

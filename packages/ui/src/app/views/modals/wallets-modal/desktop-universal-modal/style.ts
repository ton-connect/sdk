import { styled } from 'solid-styled-components';
import { Button, H2, QRCode, Text, Image } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const DesktopUniversalModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
`;

/** The caption under the QR code, as on the phone. */
export const H2Styled = styled(H2)`
    max-width: 320px;
    margin-bottom: 28px;
    font-size: 13px;
    line-height: 17px;
`;

export const H2AvailableWalletsStyled = styled(H2)`
    margin-bottom: 16px;
`;

export const QRCodeStyled = styled(QRCode)`
    margin-top: 24px;
    margin-bottom: 14px;
`;

export const WalletsContainerStyled = styled.ul`
    display: flex;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;

export const ActionButtonStyled = styled(Button)<{ disableEventsAnimation?: boolean }>`
    position: relative;
    font-size: 16px;
    line-height: 20px;
    width: 100%;
    padding: 0 16px;
    height: 56px;
    border-radius: ${props => borders[props.theme!.borderRadius]};

    &:hover {
        ${props => (props.disableEventsAnimation ? 'transform: unset;' : '')}
    }

    &:active {
        ${props => (props.disableEventsAnimation ? 'transform: unset;' : '')}
    }
`;

export const PopupWrapperStyled = styled.ul`
    position: absolute;
    bottom: 100%;
    left: 0;
    margin: 0;
    padding: 8px;
    width: 188px;
    transform: translateY(-16px);

    background-color: ${props => props.theme!.colors.background.primary};
    border-radius: ${props => borders[props.theme!.borderRadius]};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
`;

export const ImageStyled = styled(Image)`
    width: 24px;
    height: 24px;

    border-radius: 6px;
`;

export const GetWalletStyled = styled.div`
    margin-top: 23px;
    margin-bottom: 1px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const TextStyled = styled(Text)`
    color: ${props => props.theme!.colors.text.secondary};
    font-size: 16px;
`;

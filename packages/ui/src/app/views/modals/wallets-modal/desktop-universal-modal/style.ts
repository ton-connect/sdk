import { styled } from 'solid-styled-components';
import { Button, H2, QRCode, Text, Image } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

const hoverBorders: BorderRadiusConfig = {
    m: '8px',
    s: '4px',
    none: '0'
};

export const DesktopUniversalModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
`;

export const H2Styled = styled(H2)`
    max-width: 320px;
    margin-top: 2px;
    margin-bottom: 20px;
`;

export const H2AvailableWalletsStyled = styled(H2)`
    margin-bottom: 16px;
`;

export const QRCodeStyled = styled(QRCode)`
    margin-bottom: 24px;
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

export const ExtensionLiStyled = styled.li`
    padding: 8px;

    display: flex;
    align-items: center;
    gap: 8px;

    cursor: pointer;
    border-radius: ${props => hoverBorders[props.theme!.borderRadius]};

    transition: background-color, transform 0.1s ease-in-out;

    &:hover {
        background-color: ${props => props.theme!.colors.background.secondary};
    }

    &:active {
        transform: scale(0.96);
    }
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

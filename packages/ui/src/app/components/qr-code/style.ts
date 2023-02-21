import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { toPx } from 'src/app/utils/css';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const qrNormalSize = 256;
export const imgSize = 60;

const qrPaddingTop = 24;

export const QRCodeBackgroundWrapper = styled.div`
    width: 100%;
    position: relative;
`;

export const QrCodeBackground = styled.div`
    background-color: ${props => props.theme!.colors.background.secondary};
    border-radius: ${props => borders[props.theme!.borderRadius]};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${toPx(qrPaddingTop)} 0;
    height: ${toPx(qrNormalSize + qrPaddingTop * 2)};
    width: 100%;
`;

export const QrCodeWrapper = styled.div`
    position: relative;

    > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    rect {
        fill: transparent;
    }

    path {
        fill: ${props => props.theme!.colors.text.primary};
    }
`;

export const ImageBackground = styled.div`
    position: absolute;
    width: ${toPx(imgSize)};
    height: ${toPx(imgSize)};
    background: ${props => props.theme!.colors.background.secondary};

    display: flex;
    align-items: center;
    justify-content: center;

    > img {
        width: 48px;
        height: 48px;
        border-radius: 12px;
    }
`;

export const CopyButtonContainerStyled = styled.div``;

export const CopyButtonStyled = styled(Button)`
    position: absolute;
    bottom: 14px;
    left: 50%;

    transform: translate(-50%, 0);

    background-color: ${props => props.theme!.colors.background.segment};
    color: ${props => props.theme!.colors.text.primary};

    &:hover {
        transform: translate(-50%, 0) scale(1.04);
    }

    &:active {
        transform: translate(-50%, 0) scale(0.96);
    }
`;

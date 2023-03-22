import { styled } from 'solid-styled-components';
import { Button, Image } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { toPx } from 'src/app/utils/css';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const qrNormalSize = 256;
export const imgSizeDefault = 60;

export const picSizeDefault = 48;

const qrPaddingTop = 24;

export const QrCodeBackground = styled.div`
    display: flex;
    align-items: center;
    position: relative;
    background-color: ${props => props.theme!.colors.background.secondary};
    border-radius: ${props => borders[props.theme!.borderRadius]};
    padding: ${toPx(qrPaddingTop)} 0;
    height: ${toPx(qrNormalSize + qrPaddingTop * 2)};
    width: 100%;

    overflow: hidden;
`;

export const QrCodeWrapper = styled.div`
    position: relative;

    width: fit-content;
    margin: 0 auto;

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
    width: ${toPx(imgSizeDefault)};
    height: ${toPx(imgSizeDefault)};
    background: ${props => props.theme!.colors.background.secondary};

    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ImageStyled = styled(Image)<{ size: number }>`
    width: ${props => toPx(props.size)};
    height: ${props => toPx(props.size)};
    border-radius: 12px;
`;

export const CopyButtonStyled = styled(Button)`
    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.08));
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

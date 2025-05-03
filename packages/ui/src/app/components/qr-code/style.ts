import { styled } from 'solid-styled-components';
import { Image } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { toPx } from 'src/app/utils/css';
import { mediaNotTouch, mediaTouch } from 'src/app/styles/media';

const backgroundBorders: BorderRadiusConfig = {
    m: '16px',
    s: '12px',
    none: '0'
};

const imageBorders: BorderRadiusConfig = {
    m: '12px',
    s: '8px',
    none: '0'
};

export const qrNormalSize = 256;
export const imgSizeDefault = 60;

export const picSizeDefault = 48;

const qrPaddingTop = 24;

export const CopyIconButton = styled.div`
    width: 52px;
    height: 52px;
    background: transparent;
    position: absolute;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.125s ease-in-out;
`;

export const QrCodeBackground = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: ${props => props.theme!.colors.background.qr};
    border-radius: ${props => backgroundBorders[props.theme!.borderRadius]};
    padding: ${toPx(qrPaddingTop)} 0;
    height: ${toPx(qrNormalSize + qrPaddingTop * 2)};
    width: 100%;

    overflow: hidden;
    cursor: pointer;
    border: none;

    ${mediaNotTouch} {
        &:hover {
            ${CopyIconButton.class} {
                transform: scale(1.04);
            }
        }
    }

    &:active {
        ${CopyIconButton.class} {
            transform: scale(0.96);
        }
    }

    ${mediaTouch} {
        &:active {
            ${CopyIconButton.class} {
                transform: scale(0.92);
            }
        }
    }
`;

export const QrCodeWrapper = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
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
        fill: ${props => props.theme!.colors.constant.black};
    }
`;

export const ImageBackground = styled.div`
    position: absolute;
    width: ${toPx(imgSizeDefault)};
    height: ${toPx(imgSizeDefault)};
    background: ${props => props.theme!.colors.background.qr};

    display: flex;
    align-items: center;
    justify-content: center;
`;

export const ImageStyled = styled(Image)<{ size: number }>`
    width: ${props => toPx(props.size)};
    height: ${props => toPx(props.size)};
    border-radius: ${props => imageBorders[props.theme!.borderRadius]};
    background-color: ${props => props.theme!.colors.background.qr};
`;

export const CopiedBoxStyled = styled.div`
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translate(-50%, 0);

    display: flex;
    gap: 6px;
    align-items: center;
    border-radius: 18px;
    min-width: 126px;
    padding: 9px 16px 9px 10px;

    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.08));
    background-color: ${props => props.theme!.colors.background.segment};
`;

import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const imgSize = '52';

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
    padding: 24px 0;
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
    width: ${imgSize}px;
    height: ${imgSize}px;
    background: ${props => props.theme!.colors.background.secondary};

    display: flex;
    align-items: center;
    justify-content: center;

    > img {
        width: 46px;
        height: 46px;
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

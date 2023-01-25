import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const QrCodeStyled = styled.div`
    margin-bottom: 16px;
    background-color: ${props => props.theme!.colors.background.secondary};
    border-radius: ${props => borders[props.theme!.borderRadius]};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
    position: relative;
    width: 100%;

    > div:first-child {
        height: 276px;
        width: 276px;

        display: flex;
        align-items: center;
        justify-content: center;

        > svg {
            height: 276px;
            width: 276px;
        }
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
    width: 52px;
    height: 52px;
    background: ${props => props.theme!.colors.background.secondary};
    padding: 7px;
    top: 112px;
    left: 112px;

    display: flex;
    align-items: center;
    justify-content: center;

    > img {
        width: 46px;
        height: 46px;
        border-radius: 12px;
    }
`;

export const CopyButtonStyled = styled(Button)`
    position: absolute;
    bottom: 16px;

    background-color: ${props => props.theme!.colors.background.segment};
    color: ${props => props.theme!.colors.text.primary};

    transform: translateY(0);
`;

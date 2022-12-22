import { styled } from 'solid-styled-components';

export const QrCodeStyled = styled.div`
    position: relative;

    > div:first-child {
        height: 276px;
        width: 276px;
    }

    rect {
        fill: transparent;
    }

    path {
        fill: ${props => props.theme!.colors.font.primary};
    }
`;

export const ImageBackground = styled.div`
    position: absolute;
    width: 52px;
    height: 52px;
    background: ${props => props.theme!.colors.backgroundSecondary};
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

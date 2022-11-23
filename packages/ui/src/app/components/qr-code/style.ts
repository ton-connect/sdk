import { styled } from 'solid-styled-components';

export const QrCodeStyled = styled.div`
    position: relative;

    rect {
        fill: transparent;
    }
`;

export const ImageBackground = styled.div`
    position: absolute;
    width: 52px;
    height: 52px;
    background: #eff1f3;
    padding: 7px;
    top: 104px;
    left: 104px;

    display: flex;
    align-items: center;
    justify-content: center;

    > img {
        width: 46px;
        height: 46px;
        border-radius: 12px;
    }
`;

import { styled } from 'solid-styled-components';
import { Button, H2, QRCode } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};
export const UniversalQrModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const H2Styled = styled(H2)`
    max-width: 320px;
    margin-bottom: 24px;
`;

export const QRCodeStyled = styled(QRCode)`
    margin-bottom: 16px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    gap: 16px;
`;

export const ActionButtonStyled = styled(Button)`
    font-size: 16px;
    line-height: 20px;
    letter-spacing: -0.32px;
    width: 100%;
    border-radius: ${props => borders[props.theme!.borderRadius]};
`;

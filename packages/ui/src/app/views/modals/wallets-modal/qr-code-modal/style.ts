import { styled } from 'solid-styled-components';
import { Button, H1, IconButton, QRCode, Text } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { media } from 'src/app/styles/media';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const QrCodeModalStyled = styled.div`
    ${media('mobile')} {
        padding: 10px 16px 0 16px;
    }
`;

export const H1Styled = styled(H1)`
    max-width: 320px;
    margin: 0 auto 6px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const QRStyled = styled(QRCode)`
    margin-bottom: 16px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    gap: 16px;
    height: 56px;
    margin-bottom: 24px;
`;

export const ActionButtonStyled = styled(Button)`
    padding: 0 16px;
    height: 56px;
    font-size: 16px;
    line-height: 20px;
    width: 100%;
    border-radius: ${props => borders[props.theme!.borderRadius]};
`;

export const GetWalletStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const TextStyled = styled(Text)`
    padding-left: 8px;
    color: ${props => props.theme!.colors.text.secondary};
    font-size: 16px;
`;

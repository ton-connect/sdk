import { styled } from 'solid-styled-components';
import { Button, ErrorIcon, H1, H2, IconButton, LoaderIcon, Text } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { media } from 'src/app/styles/media';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const DesktopConnectionModalStyled = styled.div`
    display: flex;
    padding-bottom: 24px;
    flex-direction: column;
    ${media('mobile')} {
        padding: 10px 16px 0 16px;
    }
`;

export const BodyStyled = styled.div<{ qr: boolean }>`
    flex: 1;
    margin-top: ${props => (props.qr ? '0' : '18px')};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;

export const H1Styled = styled(H1)`
    max-width: 288px;
    margin: 0 auto 2px;
`;

export const H2Styled = styled(H2)`
    max-width: 288px;
    text-align: center;
    margin: 0 auto 20px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
`;

export const FooterButton = styled(Button)<{ mt: boolean }>`
    margin-top: ${props => (props.mt ? '24px' : '0')};
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

export const LoaderStyled = styled(LoaderIcon)`
    margin-bottom: 16px;
`;

export const ErrorIconStyled = styled(ErrorIcon)`
    margin-bottom: 16px;
`;

export const BodyTextStyled = styled(Text)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;

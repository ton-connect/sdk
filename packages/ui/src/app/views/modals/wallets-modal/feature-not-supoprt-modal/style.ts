import { styled } from 'solid-styled-components';
import { Button, ErrorIcon, H1, H2, IconButton, Text } from 'src/app/components';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const borders: BorderRadiusConfig = {
    m: '16px',
    s: '8px',
    none: '0'
};

export const H1Styled = styled(H1)`
    max-width: 288px;
    margin: 0 auto 38px;
`;

export const DesktopFeatureNotSupportModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const TitleStyled = styled(H1)`
    text-align: center;
    font-size: 20px;
    line-height: 28px;
`;

export const DescriptionStyled = styled(Text)`
    margin-top: 12px;
    margin-bottom: 24px;
    text-align: center;
    max-width: 360px;
    font-weight: 400;
    color: ${props => props.theme!.colors.text.secondary};
`;

export const RestoreWalletLinkStyled = styled.button`
    background: transparent;
    border: none;
    padding: 0;
    margin: 0;
    color: ${props => props.theme!.colors.accent};
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
`;

export const Spacer = styled.div`
    margin-bottom: 46px;
`;

export const ErrorIconStyled = styled(ErrorIcon)`
    margin-bottom: 16px;
`;

export const WalletsContainerStyled = styled.ul`
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    list-style: none;
    padding: 0;
`;

export const DisconnectButtonStyled = styled(Button)`
    max-width: 320px;
    width: 100%;
    height: 48px;
    font-size: 16px;
    line-height: 20px;
    border-radius: ${props => borders[props.theme!.borderRadius]};
    margin-bottom: 28px;
`;

export const BodyTextStyled = styled(H2)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 31px;
`;

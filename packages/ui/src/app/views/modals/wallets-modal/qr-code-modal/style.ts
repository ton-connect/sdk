import { styled } from 'solid-styled-components';
import { IconButton, Text } from 'src/app/components';

export const QrCodeModalStyled = styled.div`
    padding: 0 24px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const QRBackgroundStyled = styled.div`
    margin-bottom: 31px;
    background-color: ${props => props.theme!.colors.backgroundSecondary};
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 0;
`;

export const GetWalletStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

export const TextStyled = styled(Text)`
    color: ${props => props.theme!.colors.font.secondary};
    font-size: 16px;
`;

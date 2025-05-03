import { styled } from 'solid-styled-components';
import { WalletImage } from './wallet-image';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

const containerBorders: BorderRadiusConfig = {
    m: '16px',
    s: '12px',
    none: '0'
};

const walletBorders: BorderRadiusConfig = {
    m: '6px',
    s: '6px',
    none: '0'
};

export const FourWalletsCard = styled.div`
    width: 60px;
    height: 60px;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: ${props => containerBorders[props.theme!.borderRadius]};
    background-color: ${props => props.theme!.colors.background.tint};
    display: grid;
    grid-template: 1fr 1fr / 1fr 1fr;
    gap: 4px;
`;

export const FourWalletsImage = styled(WalletImage)`
    width: 20px;
    height: 20px;
    border-radius: ${props => walletBorders[props.theme!.borderRadius]};
`;

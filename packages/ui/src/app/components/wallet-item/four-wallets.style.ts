import { styled } from 'solid-styled-components';
import { WalletImage } from './wallet-image';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';
import { chip } from 'src/app/styles/chip';

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

/**
 * The folder of the "View all wallets" tile: the translucent pill of the secondary buttons, so the
 * sheet shows through it instead of a solid grey square that clashes with some backgrounds.
 */
export const FourWalletsCard = styled.div`
    width: 60px;
    height: 60px;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: ${props => containerBorders[props.theme!.borderRadius]};
    ${props => chip(props.theme!, 0.5)}
    display: grid;
    grid-template: 1fr 1fr / 1fr 1fr;
    gap: 4px;
`;

export const FourWalletsImage = styled(WalletImage)`
    width: 20px;
    height: 20px;
    border-radius: ${props => walletBorders[props.theme!.borderRadius]};
`;

import { styled } from 'solid-styled-components';
import { WalletImage } from './wallet-image';

export const FourWalletsCard = styled.div`
    width: 60px;
    height: 60px;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 16px;
    background-color: ${props => props.theme!.colors.background.tint};
    display: grid;
    grid-template: 1fr 1fr / 1fr 1fr;
    gap: 4px;
`;

export const FourWalletsImage = styled(WalletImage)`
    width: 20px;
    height: 20px;
    border-radius: 6px;
`;

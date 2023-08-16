import { Component, createMemo, createSignal, For } from 'solid-js';
import {
    H2Styled,
    QRCodeStyled,
    H2AvailableWalletsStyled,
    WalletsContainerStyled,
    DesktopUniversalModalStyled
} from './style';
import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { FourWalletsItem, H1, WalletLabeledItem } from 'src/app/components';
import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';
import { IMG } from 'src/app/env/IMG';

interface DesktopUniversalModalProps {
    additionalRequest: ConnectAdditionalRequest;

    walletsList: PersonalizedWalletInfo[];

    onSelectWallet: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const DesktopUniversalModal: Component<DesktopUniversalModalProps> = props => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;

    const walletsBridges = props.walletsList
        .filter(isWalletInfoRemote)
        .map(item => ({ bridgeUrl: item.bridgeUrl, universalLink: item.universalLink }));

    setLastSelectedWalletInfo({ openMethod: 'qrcode' });
    const request = createMemo(() => connector.connect(walletsBridges, props.additionalRequest));

    return (
        <DesktopUniversalModalStyled
            onClick={() => setPopupOpened(false)}
            data-tc-universal-qr-desktop="true"
        >
            <H1>Connect your wallet</H1>
            <H2Styled>Scan with your mobile wallet</H2Styled>
            <QRCodeStyled sourceUrl={request()} disableCopy={popupOpened()} imageUrl={IMG.TON} />
            <H2AvailableWalletsStyled>Available wallets</H2AvailableWalletsStyled>
            <WalletsContainerStyled>
                <For each={props.walletsList.slice(0, 3)}>
                    {wallet => (
                        <li>
                            <WalletLabeledItem
                                wallet={wallet}
                                onClick={() => props.onSelectWallet(wallet)}
                            />
                        </li>
                    )}
                </For>
                <FourWalletsItem
                    labelLine1="View all"
                    labelLine2="wallets"
                    images={props.walletsList.slice(3, 7).map(i => i.imageUrl)}
                    onClick={() => props.onSelectAllWallets()}
                />
            </WalletsContainerStyled>
        </DesktopUniversalModalStyled>
    );
};

import { Component, createMemo, createSignal, For } from 'solid-js';
import {
    DesktopUniversalModalStyled,
    H2AvailableWalletsStyled,
    H2Styled,
    QRCodeStyled,
    WalletsContainerStyled
} from './style';
import { ConnectAdditionalRequest } from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { FourWalletsItem, H1, WalletLabeledItem } from 'src/app/components';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { IMG } from 'src/app/env/IMG';

import { addReturnStrategy } from 'src/app/utils/url-strategy-helpers';
import { bridgesIsEqual, getUniqueBridges } from 'src/app/utils/bridge';

interface DesktopUniversalModalProps {
    additionalRequest: ConnectAdditionalRequest;

    walletsList: UIWalletInfo[];

    onSelect: (walletInfo: UIWalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const DesktopUniversalModal: Component<DesktopUniversalModalProps> = props => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;

    const walletsBridges = createMemo(() => getUniqueBridges(props.walletsList), null, {
        equals: bridgesIsEqual
    });

    setLastSelectedWalletInfo({ openMethod: 'qrcode' });
    const request = createMemo(() => connector.connect(walletsBridges(), props.additionalRequest));

    const supportedWallets = createMemo(
        () => props.walletsList.filter(wallet => wallet.isSupportRequiredFeatures),
        null
    );

    const visibleWallets = createMemo(() => supportedWallets().slice(0, 3), null);

    const fourWalletsItem = createMemo(
        () =>
            props.walletsList
                .filter(wallet => !visibleWallets().find(w => w.appName === wallet.appName))
                .slice(0, 4),
        null
    );

    return (
        <DesktopUniversalModalStyled
            onClick={() => setPopupOpened(false)}
            data-tc-wallets-modal-universal-desktop="true"
        >
            <H1 translationKey="walletModal.desktopUniversalModal.connectYourWallet">
                Connect your wallet
            </H1>
            <H2Styled translationKey="walletModal.desktopUniversalModal.scan">
                Scan with your mobile wallet
            </H2Styled>
            <QRCodeStyled
                sourceUrl={addReturnStrategy(request()!, 'none')}
                disableCopy={popupOpened()}
                imageUrl={IMG.TON}
            />
            <H2AvailableWalletsStyled translationKey="walletModal.desktopUniversalModal.availableWallets">
                Available wallets
            </H2AvailableWalletsStyled>
            <WalletsContainerStyled>
                <For each={visibleWallets()}>
                    {wallet => (
                        <li>
                            <WalletLabeledItem
                                wallet={wallet}
                                onClick={() => props.onSelect(wallet)}
                            />
                        </li>
                    )}
                </For>
                <FourWalletsItem
                    labelLine1="View all"
                    labelLine2="wallets"
                    images={fourWalletsItem().map(i => i.imageUrl)}
                    onClick={() => props.onSelectAllWallets()}
                />
            </WalletsContainerStyled>
        </DesktopUniversalModalStyled>
    );
};

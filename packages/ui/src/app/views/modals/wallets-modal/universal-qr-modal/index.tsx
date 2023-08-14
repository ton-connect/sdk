import { Component, createMemo, createSignal, For } from 'solid-js';
import {
    UniversalQrModalStyled,
    H2Styled,
    QRCodeStyled,
    H2AvailableWalletsStyled,
    WalletsContainerStyled
} from './style';
import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    isWalletInfoRemote,
    WalletInfo
} from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { FourWalletsItem, H1, WalletItem } from 'src/app/components';
import { AT_WALLET_NAME } from 'src/app/models/at-wallet-name';
import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';

interface UniversalQrModalProps {
    additionalRequest: ConnectAdditionalRequest;

    walletsList: PersonalizedWalletInfo[];

    onSelectWallet: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const UniversalQrModal: Component<UniversalQrModalProps> = props => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;

    const walletsBridges = props.walletsList
        .filter(isWalletInfoRemote)
        .map(item => ({ bridgeUrl: item.bridgeUrl, universalLink: item.universalLink }));

    setLastSelectedWalletInfo({ openMethod: 'qrcode' });
    const request = createMemo(() => connector.connect(walletsBridges, props.additionalRequest));

    const walletsSecondLines = (): (string | undefined)[] => {
        let popularUsed = false;
        return props.walletsList.slice(0, 3).map(i => {
            if (i.name === AT_WALLET_NAME) {
                return undefined;
            }
            if ('isPreferred' in i && i.isPreferred) {
                return 'Recent';
            }
            if (isWalletInfoCurrentlyInjected(i)) {
                return 'Installed';
            }
            if (!popularUsed) {
                popularUsed = true;
                return 'Popular';
            }
            return undefined;
        });
    };

    return (
        <UniversalQrModalStyled
            onClick={() => setPopupOpened(false)}
            data-tc-universal-qr-desktop="true"
        >
            <H1>Connect your wallet</H1>
            <H2Styled>Scan with your mobile wallet</H2Styled>
            <QRCodeStyled
                sourceUrl={request()}
                disableCopy={popupOpened()}
                imageUrl="https://raw.githubusercontent.com/ton-connect/sdk/main/assets/ton-icon-48.png"
            />
            <H2AvailableWalletsStyled>Available wallets</H2AvailableWalletsStyled>
            <WalletsContainerStyled>
                <For each={props.walletsList.slice(0, 3)}>
                    {(wallet, index) => (
                        <li>
                            {wallet.name === AT_WALLET_NAME ? (
                                <WalletItem
                                    icon={wallet.imageUrl}
                                    name={wallet.name + ' on'}
                                    secondLine="Telegram"
                                    badgeUrl="https://raw.githubusercontent.com/ton-connect/sdk/main/assets/tg.png"
                                    onClick={() => {}}
                                />
                            ) : (
                                <WalletItem
                                    icon={wallet.imageUrl}
                                    name={wallet.name}
                                    secondLine={walletsSecondLines()[index()]}
                                    secondLineColorPrimary={false}
                                    onClick={() => props.onSelectWallet(wallet)}
                                />
                            )}
                        </li>
                    )}
                </For>
                <FourWalletsItem
                    labelLine1="View all"
                    labelLine2="wallets"
                    images={props.walletsList.slice(3, 7).map(i => i.imageUrl)}
                    onClick={props.onSelectAllWallets}
                />
            </WalletsContainerStyled>
        </UniversalQrModalStyled>
    );
};

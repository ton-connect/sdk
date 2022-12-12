import {
    isWalletInfoInjected,
    WalletInfo,
    WalletInfoInjected,
    WalletInfoRemote
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createResource,
    createSignal,
    onCleanup,
    Show,
    useContext
} from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    setLastSelectedWalletInfo,
    setWalletsModalOpen,
    walletsModalOpen
} from 'src/app/state/modals-state';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { SelectWalletModal } from 'src/app/views/modals/wallets-modal/select-wallet-modal';
import {
    ModalWrapper,
    StyledModal,
    LoaderIconStyled,
    LoaderContainerStyled,
    H1Styled
} from './style';
import { openLinkBlank } from 'src/app/utils/web-api';
import { isDevice } from 'src/app/styles/media';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';

export const WalletsModal: Component = () => {
    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext);
    const [walletsList] = createResource(() => tonConnectUI!.getWallets());

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);

    const onClose = (): void => {
        setWalletsModalOpen(false);
        setSelectedWalletInfo(null);
    };

    const onSelect = (walletInfo: WalletInfo): void => {
        setLastSelectedWalletInfo(walletInfo);

        if (isDevice('mobile') && 'universalLink' in walletInfo) {
            return onSelectIfMobile(walletInfo);
        }

        if (isWalletInfoInjected(walletInfo) && walletInfo.injected) {
            return onSelectIfInjected(walletInfo);
        }

        setSelectedWalletInfo(walletInfo);
    };

    const onSelectIfMobile = (walletInfo: WalletInfoRemote): void => {
        const universalLink = connector.connect({
            universalLink: walletInfo.universalLink,
            bridgeUrl: walletInfo.bridgeUrl
        });

        openLinkBlank(universalLink);
    };

    const onSelectIfInjected = (walletInfo: WalletInfoInjected): void => {
        connector.connect({
            jsBridgeKey: walletInfo.jsBridgeKey
        });
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (wallet) {
            onClose();
        }
    });

    onCleanup(unsubscribe);

    createEffect(() => {
        if (walletsList()) {
            const embeddedWallet: WalletInfoInjected = walletsList()!.find(
                wallet => 'embedded' in wallet && wallet.embedded
            ) as WalletInfoInjected;

            if (embeddedWallet) {
                setLastSelectedWalletInfo(embeddedWallet);
                connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey });
                onClose();
            }
        }
    });

    return (
        <ModalWrapper>
            <StyledModal opened={walletsModalOpen()} onClose={onClose}>
                <Show when={walletsList.state !== 'ready'}>
                    <H1Styled translationKey="walletModal.loading">
                        Wallets list is loading
                    </H1Styled>
                    <LoaderContainerStyled>
                        <LoaderIconStyled fill="#7A899970" />
                    </LoaderContainerStyled>
                </Show>
                <Show when={walletsList.state === 'ready'}>
                    <Show when={!selectedWalletInfo()} keyed={false}>
                        <SelectWalletModal walletsList={walletsList()!} onSelect={onSelect} />
                    </Show>
                    <Show when={selectedWalletInfo()} keyed={false}>
                        <QrCodeModal
                            wallet={selectedWalletInfo() as WalletInfoRemote}
                            onBackClick={() => setSelectedWalletInfo(null)}
                        />
                    </Show>
                </Show>
            </StyledModal>
        </ModalWrapper>
    );
};

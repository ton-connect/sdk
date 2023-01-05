import {
    isWalletInfoInjected,
    WalletInfo,
    WalletInfoInjected,
    WalletInfoRemote
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createMemo,
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
import { openLink } from 'src/app/utils/web-api';
import { isDevice } from 'src/app/styles/media';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import { applyWalletsListConfiguration } from 'src/app/utils/wallets';

export const WalletsModal: Component = () => {
    const { locale } = useI18n()[1];
    createEffect(() => locale(appState.language));

    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext);
    const [fetchedWalletsList] = createResource(() => tonConnectUI!.getWallets());

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);

    const walletsList = createMemo(() => {
        if (fetchedWalletsList.state !== 'ready') {
            return null;
        }

        return applyWalletsListConfiguration(
            fetchedWalletsList(),
            appState.widgetConfiguration.wallets
        );
    });

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

        if ('bridgeUrl' in walletInfo) {
            setSelectedWalletInfo(walletInfo);
            return;
        }

        openLink(walletInfo.aboutUrl, '_blank');
    };

    const onSelectIfMobile = (walletInfo: WalletInfoRemote): void => {
        const universalLink = connector.connect({
            universalLink: walletInfo.universalLink,
            bridgeUrl: walletInfo.bridgeUrl
        });

        openLink(universalLink);
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

    return (
        <ModalWrapper>
            <StyledModal opened={walletsModalOpen()} onClose={onClose}>
                <Show when={!walletsList()}>
                    <H1Styled translationKey="walletModal.loading">
                        Wallets list is loading
                    </H1Styled>
                    <LoaderContainerStyled>
                        <LoaderIconStyled fill="#7A899970" />
                    </LoaderContainerStyled>
                </Show>
                <Show when={walletsList()}>
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

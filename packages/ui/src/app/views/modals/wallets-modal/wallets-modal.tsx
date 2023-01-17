import {
    ConnectAdditionalRequest,
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
    on,
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
import { StyledModal, LoaderIconStyled, LoaderContainerStyled, H1Styled } from './style';
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
    const [fetchedAdditionalRequest, { refetch }] = createResource<
        ConnectAdditionalRequest | undefined
    >((_, { refetching }) => {
        if (refetching) {
            return appState.getConnectParameters?.();
        }

        return undefined;
    });

    createEffect(
        on(walletsModalOpen, () => {
            if (walletsModalOpen() && fetchedAdditionalRequest.state !== 'refreshing') {
                refetch();
            }
        })
    );

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);

    const walletsList = createMemo(() => {
        if (fetchedWalletsList.state !== 'ready') {
            return null;
        }

        return applyWalletsListConfiguration(fetchedWalletsList(), appState.walletsList);
    });

    const additionalRequestLoading = (): boolean =>
        fetchedAdditionalRequest.state !== 'ready' && fetchedAdditionalRequest.state !== 'errored';

    const additionalRequest = createMemo(() => {
        if (fetchedAdditionalRequest.state !== 'ready') {
            return undefined;
        }

        return fetchedAdditionalRequest();
    });

    const onClose = (): void => {
        setWalletsModalOpen(false);
        setSelectedWalletInfo(null);
    };

    const onSelect = (walletInfo: WalletInfo): void => {
        if (isDevice('mobile') && 'universalLink' in walletInfo) {
            setLastSelectedWalletInfo({ ...walletInfo, openMethod: 'universal-link' });
            return onSelectIfMobile(walletInfo);
        }

        if (isWalletInfoInjected(walletInfo) && walletInfo.injected) {
            setLastSelectedWalletInfo(walletInfo);
            return onSelectIfInjected(walletInfo);
        }

        if ('bridgeUrl' in walletInfo) {
            setLastSelectedWalletInfo({ ...walletInfo, openMethod: 'qrcode' });
            setSelectedWalletInfo(walletInfo);
            return;
        }

        openLink(walletInfo.aboutUrl, '_blank');
    };

    const onSelectIfMobile = (walletInfo: WalletInfoRemote): void => {
        const universalLink = connector.connect(
            {
                universalLink: walletInfo.universalLink,
                bridgeUrl: walletInfo.bridgeUrl
            },
            additionalRequest()
        );

        openLink(universalLink);
    };

    const onSelectIfInjected = (walletInfo: WalletInfoInjected): void => {
        connector.connect(
            {
                jsBridgeKey: walletInfo.jsBridgeKey
            },
            additionalRequest()
        );
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (wallet) {
            onClose();
        }
    });

    onCleanup(unsubscribe);

    return (
        <StyledModal opened={walletsModalOpen()} onClose={onClose} id="tc-wallets-modal-container">
            <Show when={!walletsList() || additionalRequestLoading()}>
                <H1Styled translationKey="walletModal.loading">Wallets list is loading</H1Styled>
                <LoaderContainerStyled>
                    <LoaderIconStyled />
                </LoaderContainerStyled>
            </Show>
            <Show when={walletsList() && !additionalRequestLoading()}>
                <Show when={!selectedWalletInfo()} keyed={false}>
                    <SelectWalletModal
                        walletsList={walletsList()!}
                        onSelect={onSelect}
                        id="tc-wallets-modal"
                    />
                </Show>
                <Show when={selectedWalletInfo()} keyed={false}>
                    <QrCodeModal
                        additionalRequest={additionalRequest()}
                        wallet={selectedWalletInfo() as WalletInfoRemote}
                        onBackClick={() => setSelectedWalletInfo(null)}
                        id="tc-qr-modal"
                    />
                </Show>
            </Show>
        </StyledModal>
    );
};

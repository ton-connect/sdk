import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    isWalletInfoRemote,
    WalletInfo,
    WalletInfoRemote
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    Match,
    on,
    onCleanup,
    Show,
    Switch,
    useContext
} from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    setLastSelectedWalletInfo,
    setWalletsModalOpen,
    walletsModalOpen
} from 'src/app/state/modals-state';
import { QrCodeModal } from 'src/app/views/modals/wallets-modal/qr-code-modal';
import { StyledModal, LoaderContainerStyled, H1Styled, TabBarStyled, TabTextStyled } from './style';
import { openLinkBlank } from 'src/app/utils/web-api';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import { applyWalletsListConfiguration } from 'src/app/utils/wallets';
import isMobile from 'src/app/hooks/isMobile';
import { MobileSelectWalletModal } from 'src/app/views/modals/wallets-modal/mobile-select-wallet-modal';
import { UniversalQrModal } from 'src/app/views/modals/wallets-modal/universal-qr-modal';
import { DesktopSelectWalletModal } from 'src/app/views/modals/wallets-modal/desktop-select-wallet-modal';
import { LoaderIcon } from 'src/app/components';

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
    const [selectedTabIndex, setSelectedTabIndex] = createSignal(0);

    const walletsList = createMemo(() => {
        if (fetchedWalletsList.state !== 'ready') {
            return null;
        }

        let walletsList = applyWalletsListConfiguration(
            fetchedWalletsList(),
            appState.walletsListConfiguration
        );
        const preferredWalletName = appState.preferredWalletName;
        const preferredWallet = walletsList.find(item => item.name === preferredWalletName);
        const someWalletsWithSameName =
            walletsList.filter(item => item.name === preferredWalletName).length >= 2;

        if (preferredWalletName && preferredWallet && !someWalletsWithSameName) {
            walletsList = [preferredWallet].concat(
                walletsList.filter(item => item.name !== preferredWalletName)
            );
        }

        return walletsList;
    });

    const additionalRequestLoading = (): boolean =>
        fetchedAdditionalRequest.state !== 'ready' && fetchedAdditionalRequest.state !== 'errored';

    const additionalRequest = createMemo(() => {
        if (additionalRequestLoading()) {
            return undefined;
        }

        return fetchedAdditionalRequest();
    });

    const onClose = (): void => {
        setWalletsModalOpen(false);
        setSelectedWalletInfo(null);
    };

    const onSelectInDesktopList = (walletInfo: WalletInfo): void => {
        if (isWalletInfoCurrentlyInjected(walletInfo)) {
            setLastSelectedWalletInfo(walletInfo);
            connector.connect(
                {
                    jsBridgeKey: walletInfo.jsBridgeKey
                },
                additionalRequest()
            );
            return;
        }

        if (isWalletInfoRemote(walletInfo)) {
            setLastSelectedWalletInfo({ ...walletInfo, openMethod: 'qrcode' });
            setSelectedWalletInfo(walletInfo);
            return;
        }

        openLinkBlank(walletInfo.aboutUrl);
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (wallet) {
            onClose();
        }
    });

    onCleanup(unsubscribe);

    return (
        <StyledModal
            opened={walletsModalOpen()}
            onClose={onClose}
            data-tc-wallets-modal-container="true"
        >
            <Show when={additionalRequestLoading() || !walletsList()}>
                <H1Styled translationKey="walletModal.loading">Wallets list is loading</H1Styled>
                <LoaderContainerStyled>
                    <LoaderIcon size="m" />
                </LoaderContainerStyled>
            </Show>

            <Show when={!additionalRequestLoading() && walletsList()}>
                <Show when={isMobile()}>
                    <MobileSelectWalletModal
                        walletsList={walletsList()!}
                        additionalRequest={additionalRequest()!}
                    />
                </Show>

                <Show when={!isMobile()}>
                    <Show when={!selectedWalletInfo()}>
                        <div data-tc-wallets-modal-desktop="true">
                            <TabBarStyled
                                tab1={
                                    <TabTextStyled
                                        translationKey="walletModal.qrCode"
                                        cursor="unset"
                                    >
                                        QR Code
                                    </TabTextStyled>
                                }
                                tab2={
                                    <TabTextStyled
                                        translationKey="walletModal.wallets"
                                        cursor="unset"
                                    >
                                        Wallets
                                    </TabTextStyled>
                                }
                                selectedTabIndex={selectedTabIndex()}
                                onSelectedTabIndexChange={setSelectedTabIndex}
                            />

                            <Switch>
                                <Match when={selectedTabIndex() === 0}>
                                    <UniversalQrModal
                                        walletsList={walletsList()!}
                                        additionalRequest={additionalRequest()!}
                                    />
                                </Match>
                                <Match when={selectedTabIndex() === 1}>
                                    <DesktopSelectWalletModal
                                        walletsList={walletsList()!}
                                        onSelect={onSelectInDesktopList}
                                    />
                                </Match>
                            </Switch>
                        </div>
                    </Show>
                    <Show when={selectedWalletInfo()}>
                        <QrCodeModal
                            additionalRequest={additionalRequest()}
                            wallet={selectedWalletInfo() as WalletInfoRemote}
                            onBackClick={() => setSelectedWalletInfo(null)}
                        />
                    </Show>
                </Show>
            </Show>
        </StyledModal>
    );
};

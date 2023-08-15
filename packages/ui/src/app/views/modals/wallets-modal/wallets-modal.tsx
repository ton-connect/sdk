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
import { StyledModal, LoaderContainerStyled, H1Styled } from './style';
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
import { LoadableReady } from 'src/models/loadable';
import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';
import { AT_WALLET_NAME } from 'src/app/models/at-wallet-name';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';

export const WalletsModal: Component = () => {
    const { locale } = useI18n()[1];
    createEffect(() => locale(appState.language));

    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext);
    const [fetchedWalletsList] = createResource(() => tonConnectUI!.getWallets());

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);
    const [selectedTab, setSelectedTab] = createSignal<'universal' | 'all-wallets'>('universal');

    const walletsList = createMemo<PersonalizedWalletInfo[] | null>(() => {
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
            walletsList = [
                { ...preferredWallet, isPreferred: true } as PersonalizedWalletInfo
            ].concat(walletsList.filter(item => item.name !== preferredWalletName));
        }

        const atWallet = walletsList.find(item => item.name === AT_WALLET_NAME);
        if (atWallet) {
            walletsList = [atWallet].concat(
                walletsList.filter(item => item.name !== AT_WALLET_NAME)
            );
        }

        return walletsList;
    });

    const additionalRequestLoading = (): boolean =>
        appState.connectRequestParameters?.state === 'loading';

    const additionalRequest = createMemo(() => {
        if (additionalRequestLoading()) {
            return undefined;
        }

        return (appState.connectRequestParameters as LoadableReady<ConnectAdditionalRequest>)
            ?.value;
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
                <Show when={isMobile() && !selectedWalletInfo()}>
                    <MobileSelectWalletModal
                        onSelect={onSelectInDesktopList}
                        walletsList={walletsList()!}
                        additionalRequest={additionalRequest()!}
                    />
                </Show>

                <Show when={!isMobile()}>
                    <Show when={!selectedWalletInfo()}>
                        <div data-tc-wallets-modal-desktop="true">
                            <Switch>
                                <Match when={selectedTab() === 'universal'}>
                                    <UniversalQrModal
                                        walletsList={walletsList()!}
                                        additionalRequest={additionalRequest()!}
                                        onSelectAllWallets={() => setSelectedTab('all-wallets')}
                                        onSelectWallet={setSelectedWalletInfo}
                                    />
                                </Match>
                                <Match when={selectedTab() === 'all-wallets'}>
                                    <DesktopSelectWalletModal
                                        walletsList={walletsList()!}
                                        onBack={() => setSelectedTab('universal')}
                                        onSelect={setSelectedWalletInfo}
                                    />
                                </Match>
                            </Switch>
                        </div>
                    </Show>
                </Show>
                <Show when={selectedWalletInfo()}>
                    <DesktopConnectionModal
                        additionalRequest={additionalRequest()}
                        wallet={selectedWalletInfo() as WalletInfoRemote}
                        onBackClick={() => setSelectedWalletInfo(null)}
                    />
                </Show>
            </Show>
        </StyledModal>
    );
};

import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    Wallet,
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
import { getWalletsModalIsOpened } from 'src/app/state/modals-state';
import { H1Styled, LoaderContainerStyled, StyledModal } from './style';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import { applyWalletsListConfiguration, eqWalletName } from 'src/app/utils/wallets';
import { isMobile, updateIsMobile } from 'src/app/hooks/isMobile';
import { AllWalletsListModal } from 'src/app/views/modals/wallets-modal/all-wallets-list-modal';
import { LoaderIcon } from 'src/app/components';
import { LoadableReady } from 'src/models/loadable';
import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';
import { InfoModal } from 'src/app/views/modals/wallets-modal/info-modal';
import { MobileConnectionModal } from 'src/app/views/modals/wallets-modal/mobile-connection-modal';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { DesktopUniversalModal } from 'src/app/views/modals/wallets-modal/desktop-universal-modal';
import { Dynamic } from 'solid-js/web';
import { WalletsModalCloseReason } from 'src/models';

export const WalletsModal: Component = () => {
    const { locale } = useI18n()[1];
    createEffect(() => locale(appState.language));

    createEffect(() => {
        if (getWalletsModalIsOpened()) {
            updateIsMobile();
        } else {
            setSelectedWalletInfo(null);
            setSelectedTab('universal');
            setInfoTab(false);
        }
    });

    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext);
    const [fetchedWalletsList] = createResource(() => tonConnectUI!.getWallets());

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<WalletInfo | null>(null);
    const [selectedTab, setSelectedTab] = createSignal<'universal' | 'all-wallets'>('universal');
    const [infoTab, setInfoTab] = createSignal(false);

    const walletsList = createMemo<PersonalizedWalletInfo[] | null>(() => {
        if (fetchedWalletsList.state !== 'ready') {
            return null;
        }

        let walletsList = applyWalletsListConfiguration(
            fetchedWalletsList(),
            appState.walletsListConfiguration
        );

        const injectedWallets: WalletInfo[] = walletsList.filter(isWalletInfoCurrentlyInjected);
        const notInjectedWallets = walletsList.filter(w => !isWalletInfoCurrentlyInjected(w));
        walletsList = (injectedWallets || []).concat(notInjectedWallets);

        const preferredWalletAppName = appState.preferredWalletAppName;
        const preferredWallet = walletsList.find(item =>
            eqWalletName(item, preferredWalletAppName)
        );
        const someWalletsWithSameName =
            walletsList.filter(item => eqWalletName(item, preferredWalletAppName)).length >= 2;
        if (preferredWalletAppName && preferredWallet && !someWalletsWithSameName) {
            walletsList = [
                { ...preferredWallet, isPreferred: true } as PersonalizedWalletInfo
            ].concat(walletsList.filter(item => !eqWalletName(item, preferredWalletAppName)));
        }

        const atWallet = walletsList.find(item => eqWalletName(item, AT_WALLET_APP_NAME));
        if (atWallet) {
            walletsList = [atWallet].concat(
                walletsList.filter(item => !eqWalletName(item, AT_WALLET_APP_NAME))
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

    const onClose = (closeReason: WalletsModalCloseReason): void => {
        tonConnectUI!.closeModal(closeReason);
    };

    const unsubscribe = connector.onStatusChange((wallet: Wallet | null) => {
        if (wallet) {
            onClose('wallet-selected');
        }
    });

    const onSelectAllWallets = (): void => {
        setSelectedTab('all-wallets');
    };

    const onSelectUniversal = (): void => {
        setSelectedTab('universal');
    };

    const clearSelectedWalletInfo = (): void => {
        setSelectedWalletInfo(null);
    };

    onCleanup(() => {
        setSelectedWalletInfo(null);
        setInfoTab(false);
    });

    onCleanup(unsubscribe);

    return (
        <StyledModal
            opened={getWalletsModalIsOpened()}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => onClose('action-cancelled')}
            onClickQuestion={() => setInfoTab(v => !v)}
            data-tc-wallets-modal-container="true"
        >
            <Show when={infoTab()}>
                <InfoModal onBackClick={() => setInfoTab(false)} />
            </Show>

            <Show when={!infoTab()}>
                <Show when={additionalRequestLoading() || !walletsList()}>
                    <H1Styled translationKey="walletModal.loading">
                        Wallets list is loading
                    </H1Styled>
                    <LoaderContainerStyled>
                        <LoaderIcon size="m" />
                    </LoaderContainerStyled>
                </Show>

                <Show when={!additionalRequestLoading() && walletsList()}>
                    <Switch>
                        <Match when={selectedWalletInfo()}>
                            <Dynamic
                                component={
                                    isMobile() ? MobileConnectionModal : DesktopConnectionModal
                                }
                                wallet={selectedWalletInfo()! as WalletInfoRemote}
                                additionalRequest={additionalRequest()}
                                onBackClick={clearSelectedWalletInfo}
                            />
                        </Match>
                        <Match when={selectedTab() === 'universal'}>
                            <Dynamic
                                component={
                                    isMobile() ? MobileUniversalModal : DesktopUniversalModal
                                }
                                onSelect={setSelectedWalletInfo}
                                walletsList={walletsList()!}
                                additionalRequest={additionalRequest()!}
                                onSelectAllWallets={onSelectAllWallets}
                            />
                        </Match>
                        <Match when={selectedTab() === 'all-wallets'}>
                            <AllWalletsListModal
                                walletsList={walletsList()!}
                                onBack={onSelectUniversal}
                                onSelect={setSelectedWalletInfo}
                            />
                        </Match>
                    </Switch>
                </Show>
            </Show>
        </StyledModal>
    );
};

import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    WalletMissingRequiredFeaturesError,
    TonConnectError,
    Wallet,
    WalletInfoRemote,
    checkRequiredWalletFeatures,
    WalletInfo,
    WalletSelectionSurface
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    Match,
    onCleanup,
    Switch,
    useContext
} from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import { getWalletsModalIsOpened, walletsModalState } from 'src/app/state/modals-state';
import { H1Styled, LoaderContainerStyled, StyledModal } from './style';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { useI18n } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import {
    applyWalletsListConfiguration,
    eqWalletName,
    shuffleRankTies
} from 'src/app/utils/wallets';
import { trackWalletPick } from 'src/app/utils/wallet-selection';
import { isMobile, updateIsMobile } from 'src/app/hooks/isMobile';
import { AllWalletsListModal } from 'src/app/views/modals/wallets-modal/all-wallets-list-modal';
import { LoaderIcon } from 'src/app/components';
import { Crossfade } from 'src/app/components/crossfade';
import { LoadableReady } from 'src/models/loadable';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';
import { MobileConnectionModal } from 'src/app/views/modals/wallets-modal/mobile-connection-modal';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { DesktopUniversalModal } from 'src/app/views/modals/wallets-modal/desktop-universal-modal';
import { Dynamic } from 'solid-js/web';
import { WalletsModalCloseReason } from 'src/models';
import { DesktopFeatureNotSupportModal } from './feature-not-supoprt-modal';
import { widgetController } from 'src/app/widget-controller';
import { logDebug } from 'src/app/utils/log';
import { ChooseSupportedFeatureWalletsModal } from 'src/models/wallets-modal';

export const WalletsModal: Component = () => {
    const { locale } = useI18n()[1];
    createEffect(() => locale(appState.language));

    createEffect(() => {
        if (getWalletsModalIsOpened()) {
            updateIsMobile();
            rankTieDraws = [];
            refetchWallets();
        } else {
            setSelectedWalletInfo(null);
            setSelectedTab('universal');
            setIsWalletsRowUnfolded(false);
        }
    });

    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext);

    const [fetchedWalletsList, { refetch: refetchWallets }] = createResource(() => {
        return tonConnectUI!.getWallets();
    });

    /**
     * Wallets sharing a rank are put in a random order once per opening, so every screen shows
     * them alike until the modal closes. The order is drawn on the merged list, so includeWallets
     * entries take part. The memo below re-runs while the modal is open, on any uiOptions update
     * for one, so it replays the draws this opening has made instead of drawing again.
     */
    let rankTieDraws: number[] = [];
    const replayRankTieDraws = (): (() => number) => {
        let next = 0;
        return () => {
            if (next === rankTieDraws.length) {
                rankTieDraws.push(Math.random());
            }
            return rankTieDraws[next++]!;
        };
    };

    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal<UIWalletInfo | null>(null);
    const [selectedWalletError, setSelectedWalletError] = createSignal<
        'missing-features' | 'not-supported' | null
    >(null);
    const [selectedTab, setSelectedTab] = createSignal<'universal' | 'all-wallets'>('universal');
    // Kept here rather than on the mobile screen, which is rebuilt every time the user comes back
    // to it, so the folded row stays open until the modal closes.
    const [isWalletsRowUnfolded, setIsWalletsRowUnfolded] = createSignal(false);

    const walletsModalIsWalletNotSupportFeature = createMemo(() => {
        const state = walletsModalState();
        return 'type' in state && state.type === 'wallet-not-support-feature';
    });

    // While the list is fetched again on opening, the one fetched before stays on screen, so the
    // modal does not show its loading screen for a moment and crossfade back
    const walletsList = createMemo<UIWalletInfo[] | null>(() => {
        if (fetchedWalletsList.state !== 'ready' && fetchedWalletsList.state !== 'refreshing') {
            return null;
        }

        let walletsList = shuffleRankTies(
            applyWalletsListConfiguration(
                fetchedWalletsList.latest!,
                appState.walletsListConfiguration
            ),
            replayRankTieDraws()
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
                { ...preferredWallet, isPreferred: true } as WalletInfo & {
                    isPreferred?: boolean;
                }
            ].concat(walletsList.filter(item => !eqWalletName(item, preferredWalletAppName)));
        }

        const walletsFeaturesRequested =
            tonConnectUI?.walletsRequiredFeatures ?? tonConnectUI?.walletsPreferredFeatures;

        const uiWallets = walletsList.map(wallet => ({
            ...wallet,
            isSupportRequiredFeatures: walletsFeaturesRequested
                ? checkRequiredWalletFeatures(wallet.features ?? [], walletsFeaturesRequested)
                : true
        }));

        return uiWallets;
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

    const unsubscribe = connector.onStatusChange(
        (wallet: Wallet | null) => {
            if (wallet) {
                onClose('wallet-selected');
            }
        },
        err => {
            if (err instanceof WalletMissingRequiredFeaturesError) {
                const errorAppName = err.cause.connectEvent.device.appName;
                const wallet = walletsList()?.find(w => eqWalletName(w, errorAppName));

                if (!wallet) {
                    throw new TonConnectError('Wallet not found');
                }

                const walletErrorType = wallet.isSupportRequiredFeatures
                    ? 'missing-features'
                    : 'not-supported';
                setSelectedWalletError(walletErrorType);
                setSelectedWalletInfo(wallet);
            }
        }
    );

    const onSelectAllWallets = (): void => {
        setSelectedTab('all-wallets');
    };

    const onSelectUniversal = (): void => {
        setSelectedTab('universal');
    };

    /**
     * Records the pick where it happens, with the surface supplied by the caller.
     *
     * Mobile and desktop differ in how many decisions the user makes: on mobile the connection
     * modal redirects to the wallet on mount, so the tap is the commitment; on desktop it opens a
     * second screen offering QR, extension and desktop app, so the tap is only a preselection and
     * the commitment — if the user makes one rather than scanning the QR — is recorded later by
     * the connection modal's footer buttons.
     */
    const selectWallet = (wallet: UIWalletInfo, surface: WalletSelectionSurface): void => {
        const traceId = walletsModalState().traceId;

        // No trace means nothing downstream could be correlated with this pick, so emitting would
        // produce a row the warehouse cannot join to anything — the exact defect this event
        // replaces. The modal always carries one in practice; skipping is the safe fallback.
        if (traceId) {
            trackWalletPick(appState.tracker, {
                isMobile: isMobile(),
                walletAppName: wallet.appName,
                surface,
                selectionSource: 'manual',
                traceId
            });
        }

        setSelectedWalletInfo(wallet);
    };

    const onSelectWallet = (wallet: UIWalletInfo): void => {
        setSelectedWalletInfo(wallet);
        widgetController.openWalletsModal();
    };

    const clearSelectedWalletInfo = (): void => {
        setSelectedWalletInfo(null);
        setSelectedWalletError(null);
    };

    onCleanup(() => {
        setSelectedWalletInfo(null);
        setSelectedWalletError(null);
    });

    onCleanup(unsubscribe);

    return (
        <StyledModal
            opened={getWalletsModalIsOpened()}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => onClose('action-cancelled')}
            data-tc-wallets-modal-container="true"
        >
            <Crossfade>
                <Switch>
                    <Match when={additionalRequestLoading() || !walletsList()}>
                        <div>
                            <H1Styled translationKey="walletModal.loading">
                                Wallets list is loading
                            </H1Styled>
                            <LoaderContainerStyled>
                                <LoaderIcon size="m" />
                            </LoaderContainerStyled>
                        </div>
                    </Match>
                    <Match when={walletsModalIsWalletNotSupportFeature()}>
                        <DesktopFeatureNotSupportModal
                            walletsList={walletsList()!}
                            currentWallet={tonConnectUI?.wallet as Wallet}
                            onSelect={onSelectWallet}
                            onSelectAllWallets={onSelectAllWallets}
                            onDisconnect={() => connector.disconnect().catch(e => logDebug(e))}
                            walletsModalState={
                                walletsModalState() as ChooseSupportedFeatureWalletsModal
                            }
                            onClose={() => onClose('action-cancelled')}
                        />
                    </Match>
                    <Match when={selectedWalletInfo()}>
                        <Dynamic
                            component={isMobile() ? MobileConnectionModal : DesktopConnectionModal}
                            walletsModalState={walletsModalState()}
                            wallet={selectedWalletInfo()! as WalletInfoRemote}
                            additionalRequest={additionalRequest()}
                            selectionSource="manual"
                            onBackClick={clearSelectedWalletInfo}
                            defaultError={selectedWalletError()}
                        />
                    </Match>
                    <Match when={selectedTab() === 'universal'}>
                        <Dynamic
                            component={isMobile() ? MobileUniversalModal : DesktopUniversalModal}
                            onSelect={wallet => selectWallet(wallet, 'universal-modal')}
                            walletModalState={walletsModalState()}
                            walletsList={walletsList()!}
                            additionalRequest={additionalRequest()!}
                            onSelectAllWallets={onSelectAllWallets}
                            rowUnfolded={isWalletsRowUnfolded()}
                            onRowUnfoldedChange={setIsWalletsRowUnfolded}
                        />
                    </Match>
                    <Match when={selectedTab() === 'all-wallets'}>
                        <AllWalletsListModal
                            walletsList={walletsList()!}
                            featureCheckMode={
                                tonConnectUI?.walletsRequiredFeatures ? 'strict' : 'soft'
                            }
                            onBack={onSelectUniversal}
                            traceId={walletsModalState().traceId}
                            onSelect={wallet => selectWallet(wallet, 'all-wallets-list')}
                        />
                    </Match>
                </Switch>
            </Crossfade>
        </StyledModal>
    );
};

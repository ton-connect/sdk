import { ConnectAdditionalRequest } from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    onCleanup,
    Show,
    useContext
} from 'solid-js';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    getSingleWalletModalIsOpened,
    getSingleWalletModalWalletInfo,
    singleWalletModalState
} from 'src/app/state/modals-state';
import { H1Styled, LoaderContainerStyled, StyledModal } from './style';
import { useI18n } from '@solid-primitives/i18n';
import { appState } from 'src/app/state/app.state';
import { isMobile, updateIsMobile } from 'src/app/hooks/isMobile';
import { LoaderIcon } from 'src/app/components';
import { LoadableReady } from 'src/models/loadable';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';
import { InfoModal } from 'src/app/views/modals/wallets-modal/info-modal';
import { MobileConnectionModal } from 'src/app/views/modals/wallets-modal/mobile-connection-modal';
import { Dynamic } from 'solid-js/web';
import { WalletsModalCloseReason, WalletsModalState } from 'src/models';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';

export const SingleWalletModal: Component = () => {
    const { locale } = useI18n()[1];
    createEffect(() => locale(appState.language));

    createEffect(() => {
        if (getSingleWalletModalIsOpened()) {
            updateIsMobile();
        }
    });

    const connector = useContext(ConnectorContext)!;
    const tonConnectUI = useContext(TonConnectUiContext)!;
    const [infoTab, setInfoTab] = createSignal(false);

    const additionalRequestLoading = (): boolean =>
        appState.connectRequestParameters?.state === 'loading';

    const additionalRequest = createMemo(() => {
        if (additionalRequestLoading()) {
            return undefined;
        }

        return (appState.connectRequestParameters as LoadableReady<ConnectAdditionalRequest>)
            ?.value;
    });

    /**
     * The connection modals take the wallets-modal state, but the only thing they read from it
     * on this path is the trace id — the single-wallet flow carries no embedded request. Passing
     * it keeps the connect calls on the same trace as the `connection-started` event this flow
     * already emitted, so the two can be correlated downstream.
     */
    const connectionModalState = createMemo<WalletsModalState>(() => ({
        status: 'opened',
        closeReason: null,
        traceId: singleWalletModalState().traceId
    }));

    const onClose = (closeReason: WalletsModalCloseReason): void => {
        tonConnectUI.closeSingleWalletModal(closeReason);
    };

    const unsubscribe = connector.onStatusChange(wallet => {
        if (wallet) {
            onClose('wallet-selected');
        }
    });

    onCleanup(unsubscribe);

    onCleanup(() => {
        setInfoTab(false);
    });

    return (
        <StyledModal
            opened={getSingleWalletModalIsOpened()}
            enableAndroidBackHandler={appState.enableAndroidBackHandler}
            onClose={() => onClose('action-cancelled')}
            onClickQuestion={() => setInfoTab(v => !v)}
            showFooter={true}
            data-tc-wallets-modal-container="true"
        >
            <Show when={infoTab()}>
                <InfoModal onBackClick={() => setInfoTab(false)} />
            </Show>

            <Show when={!infoTab()}>
                <Show when={additionalRequestLoading()}>
                    <H1Styled translationKey="walletModal.loading">
                        Wallets list is loading
                    </H1Styled>
                    <LoaderContainerStyled>
                        <LoaderIcon size="m" />
                    </LoaderContainerStyled>
                </Show>

                <Show when={!additionalRequestLoading()}>
                    <Dynamic
                        component={isMobile() ? MobileConnectionModal : DesktopConnectionModal}
                        wallet={getSingleWalletModalWalletInfo()!} // TODO: remove non-null assertion
                        walletsModalState={connectionModalState()}
                        additionalRequest={additionalRequest()}
                        onBackClick={() => {}}
                        backDisabled={true}
                    />
                </Show>
            </Show>
        </StyledModal>
    );
};

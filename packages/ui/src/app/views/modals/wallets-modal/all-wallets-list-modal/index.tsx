import { Component, createSignal, For, Show } from 'solid-js';
import {
    DesktopSelectWalletModalStyled,
    WalletsUl,
    H1Styled,
    StyledIconButton,
    WalletLabeledItemStyled,
    WalletsNotSupportedNotifier,
    ErrorBoxStyled,
    WalletsNotSupportedNotifierText
} from './style';
import { isMobile } from 'src/app/hooks/isMobile';
import { supportsMobile } from 'src/app/utils/wallets';
import { ScrollContainer } from 'src/app/components/scroll-container';
import { ExclamationIcon } from 'src/app/components/icons/exclamation-icon';
import { Transition } from 'solid-transition-group';
import { animate } from 'src/app/utils/animate';
import { ErrorIcon, Text } from 'src/app/components';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { setLastVisibleWalletsInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { isInTMA } from 'src/app/utils/tma-api';
import { isWalletConnectInitialized } from '@tonconnect/sdk';
import { WALLET_CONNECT_APP_NAME, WALLET_CONNECT_WALLET_NAME } from 'src/app/env/WALLET_CONNECT';
import { IMG } from 'src/app/env/IMG';

export interface DesktopSelectWalletModalProps {
    walletsList: UIWalletInfo[];

    featureCheckMode?: 'strict' | 'soft' | 'hide';

    onBack: () => void;

    onSelect: (walletInfo: UIWalletInfo) => void;
}

export const AllWalletsListModal: Component<DesktopSelectWalletModalProps> = props => {
    const maxHeight = (): number | undefined => (isMobile() ? undefined : 510);

    const connector = appState.connector;
    const additionalRequest = appState.connectRequestParameters;

    const connectWalletConnect = () => {
        connector.connect(
            { type: 'wallet-connect' },
            additionalRequest?.state === 'ready' ? additionalRequest.value : undefined
        );
    };

    const [errorSupportOpened, setErrorSupportOpened] = createSignal<UIWalletInfo | null>(null);
    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    const onErrorClick = (wallet: UIWalletInfo): void => {
        setErrorSupportOpened(wallet);

        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => setErrorSupportOpened(null), 1500);
    };

    const handleSelectWallet = (wallet: UIWalletInfo): void => {
        if (!wallet.isSupportRequiredFeatures && props.featureCheckMode === 'strict') {
            onErrorClick(wallet);
            return;
        }
        props.onSelect(wallet);
    };

    const walletsList = (): UIWalletInfo[] =>
        isMobile() ? props.walletsList.filter(supportsMobile) : props.walletsList;

    const supportedWallets = (): UIWalletInfo[] =>
        walletsList().filter(wallet => wallet.isSupportRequiredFeatures);
    setLastVisibleWalletsInfo({
        walletsMenu: 'other_wallets',
        wallets: supportedWallets()
    });

    const unsupportedWallets = (): UIWalletInfo[] =>
        walletsList().filter(wallet => !wallet.isSupportRequiredFeatures);

    return (
        <DesktopSelectWalletModalStyled data-tc-wallets-modal-list="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBack()} />
            <H1Styled translationKey="walletModal.wallets">Wallets</H1Styled>
            <ScrollContainer maxHeight={maxHeight()}>
                <WalletsUl>
                    <For each={supportedWallets()}>
                        {wallet => (
                            <li>
                                <WalletLabeledItemStyled
                                    wallet={wallet}
                                    onClick={() => props.onSelect(wallet)}
                                />
                            </li>
                        )}
                    </For>
                    <Show when={!isInTMA() && isWalletConnectInitialized()}>
                        <WalletLabeledItemStyled
                            wallet={{
                                type: 'wallet-connect',
                                name: WALLET_CONNECT_WALLET_NAME,
                                appName: WALLET_CONNECT_APP_NAME,
                                imageUrl: IMG.WALLET_CONNECT
                            }}
                            onClick={connectWalletConnect}
                        />
                    </Show>
                </WalletsUl>
                <Show when={unsupportedWallets().length > 0 && props.featureCheckMode !== 'hide'}>
                    <WalletsNotSupportedNotifier>
                        <WalletsNotSupportedNotifierText translationKey="walletModal.allWallets.walletsBelowNotSupported">
                            The wallets below don’t support all features of the connected service.
                            You can use your recovery phrase in one of the supported wallets above.
                        </WalletsNotSupportedNotifierText>
                        <ExclamationIcon size="28" />
                    </WalletsNotSupportedNotifier>
                    <WalletsUl>
                        <For each={unsupportedWallets()}>
                            {wallet => (
                                <li>
                                    <WalletLabeledItemStyled
                                        wallet={wallet}
                                        onClick={() => handleSelectWallet(wallet)}
                                        withOpacity={props.featureCheckMode === 'strict'}
                                    />
                                </li>
                            )}
                        </For>
                    </WalletsUl>
                    <Transition
                        onBeforeEnter={el => {
                            animate(
                                el,
                                [
                                    { opacity: 0, transform: 'translate(-50%, 44px)' },
                                    { opacity: 1, transform: 'translate(-50%, 0)' }
                                ],
                                {
                                    duration: 150,
                                    easing: 'ease-out'
                                }
                            );
                        }}
                        onExit={(el, done) => {
                            animate(
                                el,
                                [
                                    { opacity: 1, transform: 'translate(-50%, 0)' },
                                    { opacity: 0, transform: 'translate(-50%, 44px)' }
                                ],
                                {
                                    duration: 150,
                                    easing: 'ease-out'
                                }
                            ).finished.then(() => {
                                done();
                            });
                        }}
                    >
                        <Show when={errorSupportOpened()}>
                            <ErrorBoxStyled>
                                <ErrorIcon size="xs" />
                                <Text
                                    translationKey="walletModal.allWallets.walletNotSupportService"
                                    translationValues={{ name: errorSupportOpened()!.name }}
                                >
                                    {errorSupportOpened()!.name} doesn’t support connected service
                                </Text>
                            </ErrorBoxStyled>
                        </Show>
                    </Transition>
                </Show>
            </ScrollContainer>
        </DesktopSelectWalletModalStyled>
    );
};

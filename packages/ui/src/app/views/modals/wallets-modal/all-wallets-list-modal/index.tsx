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
                    <WalletLabeledItemStyled
                        wallet={
                            {
                                name: 'WalletConnect',
                                appName: 'WalletConnect',
                                imageUrl:
                                    'data:image/jpeg;base64,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'
                            } as any
                        }
                        onClick={() =>
                            // TODO
                            void connector.connect(
                                {
                                    projectId: '9cb446f4a1b697039a23332618d942b0',
                                    metadata: {
                                        name: 'Demo DApp',
                                        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s',
                                        icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s'
                                    }
                                },
                                // TODO
                                additionalRequest?.state === 'ready'
                                    ? additionalRequest.value
                                    : undefined
                            )
                        }
                    />
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

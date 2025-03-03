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
import { WalletInfo } from '@tonconnect/sdk';
import { isMobile } from 'src/app/hooks/isMobile';
import { supportsMobile } from 'src/app/utils/wallets';
import { ScrollContainer } from 'src/app/components/scroll-container';
import { ExclamationIcon } from 'src/app/components/icons/exclamation-icon';
import { Transition } from 'solid-transition-group';
import { animate } from 'src/app/utils/animate';
import { ErrorIcon, Text } from 'src/app/components';

export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onBack: () => void;

    onSelect: (walletInfo: WalletInfo) => void;
}

export const AllWalletsListModal: Component<DesktopSelectWalletModalProps> = props => {
    const maxHeight = (): number | undefined => (isMobile() ? undefined : 510);

    const [errorSupportOpened, setErrorSupportOpened] = createSignal<WalletInfo | null>(null);
    let timeoutId: null | ReturnType<typeof setTimeout> = null;
    const onErrorClick = (wallet: WalletInfo): void => {
        setErrorSupportOpened(wallet);

        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => setErrorSupportOpened(null), 1500);
    };

    const handleSelectWallet = (wallet: WalletInfo): void => {
        if (!wallet.isSupportRequiredFeatures) {
            onErrorClick(wallet);
            return;
        }
        props.onSelect(wallet);
    };

    const walletsList = (): WalletInfo[] =>
        isMobile() ? props.walletsList.filter(supportsMobile) : props.walletsList;

    const supportedWallets = (): WalletInfo[] =>
        walletsList().filter(wallet => wallet.isSupportRequiredFeatures);

    const unsupportedWallets = (): WalletInfo[] =>
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
                </WalletsUl>
                <Show when={unsupportedWallets().length > 0}>
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
                                        withOpacity
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

import { Component, createSignal, For, Show } from 'solid-js';
import {
    UniversalQrModalStyled,
    H2Styled,
    QRCodeStyled,
    ButtonsContainerStyled,
    ActionButtonStyled,
    PopupWrapper,
    ExtensionLi,
    GetWalletStyled,
    TextStyled
} from './style';
import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
    isWalletInfoRemote,
    WalletInfo,
    WalletInfoCurrentlyInjected
} from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { Translation } from 'src/app/components/typography/Translation';
import { addReturnStrategy, openLink } from 'src/app/utils/web-api';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { Transition } from 'solid-transition-group';
import { Button, Text } from 'src/app/components';
import { LINKS } from 'src/app/env/LINKS';
import { Link } from 'src/app/components/link';

interface UniversalQrModalProps {
    additionalRequest: ConnectAdditionalRequest;

    walletsList: WalletInfo[];
}

export const UniversalQrModal: Component<UniversalQrModalProps> = props => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;

    const walletsBridges = props.walletsList
        .filter(isWalletInfoRemote)
        .map(item => ({ bridgeUrl: item.bridgeUrl, universalLink: item.universalLink }));
    const availableInjectableWallets = props.walletsList.filter(isWalletInfoCurrentlyInjected);

    setLastSelectedWalletInfo({ openMethod: 'qrcode' });
    const request = (): string =>
        appState.connector.connect(walletsBridges, props.additionalRequest);

    const onOpenWalletClick = (): void => {
        function blurHandler(): void {
            setLastSelectedWalletInfo({ openMethod: 'universal-link' });
            window.removeEventListener('blur', blurHandler);
        }

        window.addEventListener('blur', blurHandler);

        openLink(addReturnStrategy(request(), appState.returnStrategy));
        setTimeout(() => {
            window.removeEventListener('blur', blurHandler);
        }, 200);
    };

    const onOpenExtensionClick = (e: Event): void => {
        e.stopPropagation();
        if (availableInjectableWallets.length === 1) {
            const walletInfo = availableInjectableWallets[0]!;
            setLastSelectedWalletInfo(walletInfo);

            connector.connect(
                {
                    jsBridgeKey: walletInfo.jsBridgeKey
                },
                props.additionalRequest
            );
            return;
        }

        setPopupOpened(opened => !opened);
    };

    const onExtensionClick = (walletInfo: WalletInfoCurrentlyInjected): void => {
        setLastSelectedWalletInfo(walletInfo);

        connector.connect(
            {
                jsBridgeKey: walletInfo.jsBridgeKey
            },
            props.additionalRequest
        );
    };

    return (
        <UniversalQrModalStyled onClick={() => setPopupOpened(false)}>
            <H2Styled translationKey="walletModal.universalQRModal.scanQR">
                Scan QR code with a TON Connect compatible wallet.
            </H2Styled>
            <QRCodeStyled sourceUrl={request()} disableCopy={popupOpened()} />
            <ButtonsContainerStyled>
                <ActionButtonStyled onClick={onOpenWalletClick}>
                    <Show when={availableInjectableWallets.length}>
                        <Translation translationKey="walletModal.universalQRModal.openWallet">
                            Open Wallet
                        </Translation>
                    </Show>
                    <Show when={!availableInjectableWallets.length}>
                        <Translation translationKey="walletModal.universalQRModal.openInstalledWallet">
                            Open Installed Wallet
                        </Translation>
                    </Show>
                </ActionButtonStyled>
                <Show when={availableInjectableWallets.length}>
                    <ActionButtonStyled
                        onClick={onOpenExtensionClick}
                        disableEventsAnimation={popupOpened()}
                    >
                        <Transition
                            onBeforeEnter={el => {
                                el.animate(
                                    [
                                        { opacity: 0, transform: 'translateY(0)' },
                                        { opacity: 1, transform: 'translateY(-16px)' }
                                    ],
                                    {
                                        duration: 150
                                    }
                                );
                            }}
                            onExit={(el, done) => {
                                el.animate(
                                    [
                                        { opacity: 1, transform: 'translateY(-16px)' },
                                        { opacity: 0, transform: 'translateY(0)' }
                                    ],
                                    {
                                        duration: 150
                                    }
                                ).finished.then(done);
                            }}
                        >
                            <Show when={popupOpened()}>
                                <PopupWrapper>
                                    <For each={availableInjectableWallets}>
                                        {wallet => (
                                            <ExtensionLi onClick={() => onExtensionClick(wallet)}>
                                                <img src={wallet.imageUrl} alt="" />
                                                <Text fontWeight={590}>{wallet.name}</Text>
                                            </ExtensionLi>
                                        )}
                                    </For>
                                </PopupWrapper>
                            </Show>
                        </Transition>
                        <Translation translationKey="common.openExtension">
                            Open Extension
                        </Translation>
                    </ActionButtonStyled>
                </Show>
            </ButtonsContainerStyled>
            <Show when={!availableInjectableWallets.length}>
                <GetWalletStyled>
                    <TextStyled translationKey="walletModal.universalQRModal.dontHave">
                        Don't have compatible wallet?
                    </TextStyled>
                    <Link href={LINKS.LEARN_MORE} blank>
                        <Button>
                            <Translation translationKey="common.get">GET</Translation>
                        </Button>
                    </Link>
                </GetWalletStyled>
            </Show>
        </UniversalQrModalStyled>
    );
};

import {
    ConnectAdditionalRequest,
    isTelegramUrl,
    isWalletInfoCurrentlyInjected,
    WalletMissingRequiredFeaturesError,
    WalletInfoInjectable,
    WalletInfoRemote
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createSignal,
    Match,
    onCleanup,
    Show,
    Switch,
    untrack,
    useContext
} from 'solid-js';
import {
    BodyStyled,
    BodyTextStyled,
    BottomButtonsContainerStyled,
    ButtonsContainerStyled,
    DesktopConnectionModalStyled,
    ErrorIconStyled,
    FooterButton,
    H1Styled,
    H2Styled,
    LoaderStyled,
    QRCodeStyled,
    StyledIconButton,
    TgButtonStyled,
    TgImageStyled
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    BrowserIcon,
    Button,
    DesktopIcon,
    LinkIcon,
    LoaderIcon,
    MobileIcon,
    RetryIcon
} from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { Link } from 'src/app/components/link';
import { supportsDesktop, supportsExtension, supportsMobile } from 'src/app/utils/wallets';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { IMG } from 'src/app/env/IMG';
import { Translation } from 'src/app/components/typography/Translation';
import {
    addReturnStrategy,
    redirectToTelegram,
    redirectToWallet
} from 'src/app/utils/url-strategy-helpers';

export interface DesktopConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjectable);
    onBackClick: () => void;
    backDisabled?: boolean;
    defaultError?: 'missing-features' | 'connection-declined' | 'not-supported' | null;
}

export const DesktopConnectionModal: Component<DesktopConnectionProps> = props => {
    const [mode, setMode] = createSignal<'mobile' | 'desktop' | 'extension'>('mobile');

    const [connectionErrored, setConnectionErrored] = createSignal<
        'missing-features' | 'connection-declined' | 'not-supported' | null
    >(null);

    createEffect(() => {
        setConnectionErrored(props.defaultError ?? null);
    });

    const [universalLink, setUniversalLink] = createSignal<string | undefined>();
    const [firstClick, setFirstClick] = createSignal(true);
    const connector = useContext(ConnectorContext)!;

    const unsubscribe = connector.onStatusChange(
        () => {},
        error => {
            if (error instanceof WalletMissingRequiredFeaturesError) {
                setConnectionErrored('missing-features');
                return;
            }

            if (props.wallet.appName !== AT_WALLET_APP_NAME) {
                setConnectionErrored('connection-declined');
            }
        }
    );

    onCleanup(unsubscribe);

    const generateUniversalLink = (): void => {
        // TODO: prevent double generation of universal link later and remove try-catch
        try {
            const universalLink = connector.connect(
                {
                    universalLink: props.wallet.universalLink,
                    bridgeUrl: props.wallet.bridgeUrl
                },
                props.additionalRequest
            );

            setUniversalLink(universalLink);
        } catch (e) {}
    };

    createEffect(() => {
        if (
            untrack(mode) !== 'extension' &&
            (supportsMobile(props.wallet) || supportsDesktop(props.wallet))
        ) {
            generateUniversalLink();
        }
    });

    const onClickMobile = (): void => {
        setConnectionErrored(null);
        if (mode() === 'extension') {
            generateUniversalLink();
        }

        setMode('mobile');
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'qrcode'
        });
    };

    const onClickDesktop = (): void => {
        setConnectionErrored(null);
        if (mode() === 'extension') {
            generateUniversalLink();
        }

        setMode('desktop');

        if (isTelegramUrl(universalLink())) {
            onClickTelegram();
        } else {
            const forceRedirect = !firstClick();
            setFirstClick(false);

            redirectToWallet(
                universalLink()!,
                props.wallet.deepLink,
                {
                    returnStrategy: appState.returnStrategy,
                    forceRedirect: forceRedirect
                },
                (method: 'universal-link' | 'custom-deeplink'): void => {
                    setLastSelectedWalletInfo({
                        ...props.wallet,
                        openMethod: method
                    });
                }
            );
        }
    };

    const onClickTelegram = (): void => {
        const forceRedirect = !firstClick();
        setFirstClick(false);
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        redirectToTelegram(universalLink()!, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
            forceRedirect: forceRedirect
        });
    };

    const onClickExtension = (): void => {
        setConnectionErrored(null);
        setMode('extension');
        if (isWalletInfoCurrentlyInjected(props.wallet)) {
            setLastSelectedWalletInfo(props.wallet);
            connector.connect(
                {
                    jsBridgeKey: props.wallet.jsBridgeKey
                },
                props.additionalRequest
            );
        }
    };

    if (supportsMobile(props.wallet)) {
        onClickMobile();
    } else if (supportsExtension(props.wallet)) {
        onClickExtension();
    } else {
        onClickDesktop();
    }

    return (
        <DesktopConnectionModalStyled data-tc-wallets-modal-connection-desktop="true">
            <Show when={!props.backDisabled}>
                <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            </Show>
            <H1Styled>{props.wallet.name}</H1Styled>
            <Show when={mode() === 'mobile' && !connectionErrored()}>
                <H2Styled
                    translationKey="walletModal.desktopConnectionModal.scanQR"
                    translationValues={{ name: props.wallet.name }}
                >
                    Scan the QR code below with your phone’s or {props.wallet.name}’s camera
                </H2Styled>
            </Show>

            <BodyStyled qr={mode() === 'mobile'}>
                <Switch>
                    <Match when={connectionErrored()}>
                        <ErrorIconStyled size="s" />
                        <Switch>
                            <Match when={connectionErrored() === 'missing-features'}>
                                <BodyTextStyled
                                    translationKey="walletModal.desktopConnectionModal.missingFeatures"
                                    translationValues={{ name: props.wallet.name }}
                                >
                                    Please update Wallet, your version does not support required
                                    features for this dApp
                                </BodyTextStyled>
                            </Match>
                            <Match when={connectionErrored() === 'connection-declined'}>
                                <BodyTextStyled translationKey="walletModal.desktopConnectionModal.connectionDeclined">
                                    Connection declined
                                </BodyTextStyled>
                            </Match>
                            <Match when={connectionErrored() === 'not-supported'}>
                                <BodyTextStyled
                                    translationKey="walletModal.desktopConnectionModal.notSupportedWallet"
                                    translationValues={{ name: props.wallet.name }}
                                >
                                    {props.wallet.name} doesn’t support the requested action. Please
                                    connect another wallet that supports it.
                                </BodyTextStyled>
                            </Match>
                        </Switch>
                        <ButtonsContainerStyled>
                            <Show when={connectionErrored() !== 'not-supported'}>
                                <Button
                                    leftIcon={<RetryIcon />}
                                    onClick={
                                        mode() === 'extension' ? onClickExtension : onClickDesktop
                                    }
                                >
                                    <Translation translationKey="common.retry">Retry</Translation>
                                </Button>
                            </Show>
                            <Show when={connectionErrored() === 'missing-features'}>
                                <Link href={props.wallet.aboutUrl} blank>
                                    <Button leftIcon={<LinkIcon />}>
                                        <Translation
                                            translationKey="walletModal.desktopConnectionModal.updateWallet"
                                            translationValues={{ name: props.wallet.name }}
                                        >
                                            Update {props.wallet.name}
                                        </Translation>
                                    </Button>
                                </Link>
                            </Show>
                            <Show when={connectionErrored() === 'not-supported'}>
                                <Button onClick={() => props.onBackClick()}>
                                    <Translation translationKey="walletModal.desktopConnectionModal.chooseAnotherWallet">
                                        Choose Another Wallet
                                    </Translation>
                                </Button>
                            </Show>
                        </ButtonsContainerStyled>
                    </Match>
                    <Match when={mode() === 'mobile'}>
                        <QRCodeStyled
                            disableCopy={false}
                            sourceUrl={addReturnStrategy(universalLink()!, 'none')}
                            imageUrl={props.wallet.imageUrl}
                        />
                    </Match>
                    <Match when={mode() === 'extension'}>
                        <Show when={isWalletInfoCurrentlyInjected(props.wallet)}>
                            <LoaderStyled size="s" />
                            <BodyTextStyled
                                translationKey="walletModal.desktopConnectionModal.continueInExtension"
                                translationValues={{ name: props.wallet.name }}
                            >
                                Continue in {props.wallet.name} browser extension…
                            </BodyTextStyled>
                            <ButtonsContainerStyled>
                                <Button leftIcon={<RetryIcon />} onClick={onClickExtension}>
                                    <Translation translationKey="common.retry">Retry</Translation>
                                </Button>
                            </ButtonsContainerStyled>
                        </Show>
                        <Show when={!isWalletInfoCurrentlyInjected(props.wallet)}>
                            <BodyTextStyled
                                translationKey="walletModal.desktopConnectionModal.dontHaveExtension"
                                translationValues={{ name: props.wallet.name }}
                            >
                                Seems you don't have installed {props.wallet.name} browser extension
                            </BodyTextStyled>
                            <ButtonsContainerStyled>
                                <Link href={props.wallet.aboutUrl} blank>
                                    <Button rightIcon={<LinkIcon />} onClick={onClickExtension}>
                                        <Translation
                                            translationKey="walletModal.desktopConnectionModal.getWallet"
                                            translationValues={{ name: props.wallet.name }}
                                        >
                                            Get {props.wallet.name}
                                        </Translation>
                                    </Button>
                                </Link>
                            </ButtonsContainerStyled>
                        </Show>
                    </Match>
                    <Match when={mode() === 'desktop'}>
                        <LoaderIcon size="m" />
                        <BodyTextStyled
                            translationKey="walletModal.desktopConnectionModal.continueOnDesktop"
                            translationValues={{ name: props.wallet.name }}
                        >
                            Continue in {props.wallet.name} on desktop…
                        </BodyTextStyled>
                        <ButtonsContainerStyled>
                            <Button leftIcon={<RetryIcon />} onClick={onClickDesktop}>
                                <Translation translationKey="common.retry">Retry</Translation>
                            </Button>
                            <Link href={props.wallet.aboutUrl} blank>
                                <Button rightIcon={<LinkIcon />}>
                                    <Translation
                                        translationKey="walletModal.desktopConnectionModal.getWallet"
                                        translationValues={{ name: props.wallet.name }}
                                    >
                                        Get {props.wallet.name}
                                    </Translation>
                                </Button>
                            </Link>
                        </ButtonsContainerStyled>
                    </Match>
                </Switch>
            </BodyStyled>

            <Show when={props.wallet.appName === AT_WALLET_APP_NAME}>
                <TgButtonStyled
                    rightIcon={<TgImageStyled src={IMG.TG} />}
                    scale="s"
                    onClick={onClickTelegram}
                >
                    <Translation translationKey="walletModal.desktopConnectionModal.openWalletOnTelegram">
                        Open Wallet in Telegram on desktop
                    </Translation>
                </TgButtonStyled>
            </Show>
            <Show when={props.wallet.appName !== AT_WALLET_APP_NAME}>
                <BottomButtonsContainerStyled>
                    <Show when={mode() !== 'mobile' && supportsMobile(props.wallet)}>
                        <FooterButton
                            appearance="secondary"
                            leftIcon={<MobileIcon />}
                            onClick={onClickMobile}
                        >
                            <Translation translationKey="common.mobile">Mobile</Translation>
                        </FooterButton>
                    </Show>
                    <Show when={mode() !== 'extension' && supportsExtension(props.wallet)}>
                        <FooterButton
                            appearance="secondary"
                            leftIcon={<BrowserIcon />}
                            onClick={onClickExtension}
                        >
                            <Translation translationKey="common.browserExtension">
                                Browser Extension
                            </Translation>
                        </FooterButton>
                    </Show>
                    <Show when={mode() !== 'desktop' && supportsDesktop(props.wallet)}>
                        <FooterButton
                            appearance="secondary"
                            leftIcon={<DesktopIcon />}
                            onClick={onClickDesktop}
                        >
                            <Translation translationKey="common.desktop">Desktop</Translation>
                        </FooterButton>
                    </Show>
                </BottomButtonsContainerStyled>
            </Show>
        </DesktopConnectionModalStyled>
    );
};

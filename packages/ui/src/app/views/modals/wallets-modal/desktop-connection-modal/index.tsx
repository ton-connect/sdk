import {
    ConnectAdditionalRequest,
    isTelegramUrl,
    isWalletInfoCurrentlyInjected,
    WalletMissingRequiredFeaturesError,
    WalletWrongNetworkError,
    WalletInfoInjectable,
    WalletInfoRemote,
    WalletSelectionSource
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
    AccentFooterButton,
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
    ModeStyled,
    QRCodeStyled,
    StyledIconButton
} from './style';
import { Crossfade } from 'src/app/components/crossfade';
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
import {
    stripWalletNameNote,
    supportsDesktop,
    supportsExtension,
    supportsMobile
} from 'src/app/utils/wallets';
import { TELEGRAM_WALLET_APP_NAME, WALT_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';
import { Translation } from 'src/app/components/typography/Translation';
import {
    addReturnStrategy,
    redirectToTelegram,
    redirectToWallet
} from 'src/app/utils/url-strategy-helpers';
import { WalletsModalState } from 'src/models';

export interface DesktopConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    walletsModalState?: WalletsModalState;
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjectable);
    /**
     * Who preselected the wallet. Reported on the selection the mount makes for a wallet that has
     * no QR to show, where no footer click will follow.
     */
    selectionSource: WalletSelectionSource;
    onBackClick: () => void;
    backDisabled?: boolean;
    defaultError?: 'missing-features' | 'connection-declined' | 'not-supported' | null;
}

export const DesktopConnectionModal: Component<DesktopConnectionProps> = props => {
    /** The wallet's name as this screen shows it, without a note such as Walt's "(ex. Wallet)". */
    const walletName = (): string => stripWalletNameNote(props.wallet.name);
    /**
     * A wallet that lives in Telegram, such as Walt, has no desktop app of its own: its "desktop"
     * link opens Telegram Desktop, and the accent button says so rather than naming an app that
     * does not exist.
     */
    const opensInTelegram = (): boolean =>
        props.wallet.appName !== TELEGRAM_WALLET_APP_NAME &&
        isTelegramUrl(props.wallet.universalLink);
    const [mode, setMode] = createSignal<'mobile' | 'desktop' | 'extension'>('mobile');

    const [connectionErrored, setConnectionErrored] = createSignal<
        'missing-features' | 'connection-declined' | 'not-supported' | 'wrong-network' | null
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

            if (error instanceof WalletWrongNetworkError) {
                setConnectionErrored('wrong-network');
                return;
            }

            if (props.wallet.appName !== WALT_APP_NAME) {
                setConnectionErrored('connection-declined');
            }
        }
    );

    onCleanup(unsubscribe);

    const generateUniversalLink = (): void => {
        // TODO: prevent double generation of universal link later and remove try-catch
        try {
            // Reported as display-only whichever handler runs it; when the link is then opened,
            // trackLinkOpened reports that as the initiation.
            const universalLink = connector.connect(
                {
                    universalLink: props.wallet.universalLink,
                    bridgeUrl: props.wallet.bridgeUrl
                },
                props.additionalRequest,
                { traceId: props.walletsModalState?.traceId, linkDisplayOnly: true }
            );

            setUniversalLink(universalLink);
        } catch (e) {}
    };

    // One rule for this screen: a link that is only rendered is link-generated, a link the user
    // opens is initiated, so the report sits where the redirect happens.
    const trackLinkOpened = (): void => {
        appState.tracker.trackConnectionInitiated(
            { kind: 'http-specific-wallet', bridgeUrl: props.wallet.bridgeUrl },
            props.walletsModalState?.traceId
        );
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

            trackLinkOpened();
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
        trackLinkOpened();
        redirectToTelegram(universalLink()!, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
            forceRedirect: forceRedirect
        });
    };

    /**
     * The commitment on desktop. Kept out of the handlers, which Retry and the mount dispatch
     * reuse: a retry repeats a choice already recorded, and a mount that only shows a QR is none.
     */
    const trackSelected = (
        mode: 'mobile' | 'desktop' | 'extension',
        selectionSource: WalletSelectionSource
    ): void => {
        const traceId = props.walletsModalState?.traceId;

        if (traceId) {
            appState.tracker.trackWalletSelected(
                props.wallet.appName,
                'connection-modal',
                selectionSource,
                traceId,
                mode
            );
        }
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
                props.additionalRequest,
                { traceId: props.walletsModalState?.traceId }
            );
        }
    };

    const onFooterClickExtension = (): void => {
        trackSelected('extension', 'manual');
        onClickExtension();
    };

    const onFooterClickDesktop = (): void => {
        trackSelected('desktop', 'manual');
        onClickDesktop();
    };

    /**
     * Under the QR the Mobile chip is hidden, so a wallet with only one of a browser extension and
     * a desktop app leaves a single chip there. Being the one way on from the QR besides scanning
     * it, that chip is drawn as the screen's main action and says what it opens.
     */
    const isLoneQrChip = (): boolean =>
        mode() === 'mobile' &&
        !connectionErrored() &&
        supportsExtension(props.wallet) !== supportsDesktop(props.wallet);

    // With no QR to show, the mount is the commitment, so it records a selection with the source
    // of the preselection it completes.
    if (supportsMobile(props.wallet)) {
        onClickMobile();
    } else if (supportsExtension(props.wallet)) {
        if (isWalletInfoCurrentlyInjected(props.wallet)) {
            trackSelected('extension', props.selectionSource);
        }
        onClickExtension();
    } else {
        trackSelected('desktop', props.selectionSource);
        onClickDesktop();
    }

    return (
        <DesktopConnectionModalStyled data-tc-wallets-modal-connection-desktop="true">
            <Show when={!props.backDisabled}>
                <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            </Show>
            <H1Styled>{walletName()}</H1Styled>

            <BodyStyled qr={mode() === 'mobile'}>
                <Crossfade>
                    <Switch>
                        <Match when={connectionErrored()}>
                            <ModeStyled>
                                <ErrorIconStyled size="s" />
                                <Switch>
                                    <Match when={connectionErrored() === 'missing-features'}>
                                        <BodyTextStyled
                                            translationKey="walletModal.desktopConnectionModal.missingFeatures"
                                            translationValues={{ name: walletName() }}
                                        >
                                            Please update Wallet, your version does not support
                                            required features for this dApp
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
                                            translationValues={{ name: walletName() }}
                                        >
                                            {walletName()} doesn’t support the requested action.
                                            Please connect another wallet that supports it.
                                        </BodyTextStyled>
                                    </Match>
                                    <Match when={connectionErrored() === 'wrong-network'}>
                                        <BodyTextStyled
                                            translationKey="walletModal.desktopConnectionModal.wrongNetwork"
                                            translationValues={{ name: walletName() }}
                                        >
                                            Connected wallet is on a different network. Please
                                            switch network in {walletName()} and try again.
                                        </BodyTextStyled>
                                    </Match>
                                </Switch>
                                <ButtonsContainerStyled>
                                    <Show when={connectionErrored() !== 'not-supported'}>
                                        <Button
                                            leftIcon={<RetryIcon />}
                                            onClick={
                                                mode() === 'extension'
                                                    ? onClickExtension
                                                    : onClickDesktop
                                            }
                                        >
                                            <Translation translationKey="common.retry">
                                                Retry
                                            </Translation>
                                        </Button>
                                    </Show>
                                    <Show when={connectionErrored() === 'missing-features'}>
                                        <Link href={props.wallet.aboutUrl} blank>
                                            <Button leftIcon={<LinkIcon />}>
                                                <Translation
                                                    translationKey="walletModal.desktopConnectionModal.updateWallet"
                                                    translationValues={{ name: walletName() }}
                                                >
                                                    Update {walletName()}
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
                            </ModeStyled>
                        </Match>
                        <Match when={mode() === 'mobile'}>
                            <ModeStyled>
                                <QRCodeStyled
                                    disableCopy={false}
                                    sourceUrl={addReturnStrategy(universalLink()!, 'none')}
                                    imageUrl={props.wallet.imageUrl}
                                />
                                <H2Styled
                                    translationKey="walletModal.desktopConnectionModal.scanQR"
                                    translationValues={{ name: walletName() }}
                                >
                                    Scan the QR code with your phone’s or {walletName()}’s camera
                                </H2Styled>
                            </ModeStyled>
                        </Match>
                        <Match when={mode() === 'extension'}>
                            <ModeStyled>
                                <Show when={isWalletInfoCurrentlyInjected(props.wallet)}>
                                    <LoaderStyled size="s" />
                                    <BodyTextStyled
                                        translationKey="walletModal.desktopConnectionModal.continueInExtension"
                                        translationValues={{ name: walletName() }}
                                    >
                                        Continue in {walletName()} browser extension…
                                    </BodyTextStyled>
                                    <ButtonsContainerStyled>
                                        <Button leftIcon={<RetryIcon />} onClick={onClickExtension}>
                                            <Translation translationKey="common.retry">
                                                Retry
                                            </Translation>
                                        </Button>
                                    </ButtonsContainerStyled>
                                </Show>
                                <Show when={!isWalletInfoCurrentlyInjected(props.wallet)}>
                                    <BodyTextStyled
                                        translationKey="walletModal.desktopConnectionModal.dontHaveExtension"
                                        translationValues={{ name: walletName() }}
                                    >
                                        Seems you don't have installed {walletName()} browser
                                        extension
                                    </BodyTextStyled>
                                    <ButtonsContainerStyled>
                                        <Link href={props.wallet.aboutUrl} blank>
                                            <Button
                                                leftIcon={<LinkIcon />}
                                                onClick={onClickExtension}
                                            >
                                                <Translation
                                                    translationKey="walletModal.desktopConnectionModal.getWallet"
                                                    translationValues={{ name: walletName() }}
                                                >
                                                    Get {walletName()}
                                                </Translation>
                                            </Button>
                                        </Link>
                                    </ButtonsContainerStyled>
                                </Show>
                            </ModeStyled>
                        </Match>
                        <Match when={mode() === 'desktop'}>
                            <ModeStyled>
                                <LoaderIcon size="m" />
                                <BodyTextStyled
                                    translationKey="walletModal.desktopConnectionModal.continueOnDesktop"
                                    translationValues={{ name: walletName() }}
                                >
                                    Continue in {walletName()} on desktop…
                                </BodyTextStyled>
                                <ButtonsContainerStyled>
                                    <Button leftIcon={<RetryIcon />} onClick={onClickDesktop}>
                                        <Translation translationKey="common.retry">
                                            Retry
                                        </Translation>
                                    </Button>
                                    <Link href={props.wallet.aboutUrl} blank>
                                        <Button leftIcon={<LinkIcon />}>
                                            <Translation
                                                translationKey="walletModal.desktopConnectionModal.getWallet"
                                                translationValues={{ name: walletName() }}
                                            >
                                                Get {walletName()}
                                            </Translation>
                                        </Button>
                                    </Link>
                                </ButtonsContainerStyled>
                            </ModeStyled>
                        </Match>
                    </Switch>
                </Crossfade>
            </BodyStyled>

            <BottomButtonsContainerStyled>
                <Show when={mode() !== 'mobile' && supportsMobile(props.wallet)}>
                    <FooterButton
                        appearance="secondary"
                        leftIcon={<MobileIcon />}
                        onClick={() => {
                            trackSelected('mobile', 'manual');
                            onClickMobile();
                        }}
                    >
                        <Translation translationKey="common.mobile">Mobile</Translation>
                    </FooterButton>
                </Show>
                <Show when={mode() !== 'extension' && supportsExtension(props.wallet)}>
                    <Show
                        when={isLoneQrChip()}
                        fallback={
                            <FooterButton
                                appearance="secondary"
                                leftIcon={<BrowserIcon />}
                                onClick={onFooterClickExtension}
                            >
                                <Translation translationKey="common.browserExtension">
                                    Browser Extension
                                </Translation>
                            </FooterButton>
                        }
                    >
                        <AccentFooterButton
                            icon={<BrowserIcon fill="currentColor" />}
                            onClick={onFooterClickExtension}
                            data-tc-connection-accent-button="true"
                        >
                            <Translation
                                translationKey="walletModal.desktopConnectionModal.openExtension"
                                translationValues={{ name: walletName() }}
                            >
                                Open {walletName()} Browser Extension
                            </Translation>
                        </AccentFooterButton>
                    </Show>
                </Show>
                <Show when={mode() !== 'desktop' && supportsDesktop(props.wallet)}>
                    <Show
                        when={isLoneQrChip()}
                        fallback={
                            <FooterButton
                                appearance="secondary"
                                leftIcon={<DesktopIcon />}
                                onClick={onFooterClickDesktop}
                            >
                                <Translation translationKey="common.desktop">Desktop</Translation>
                            </FooterButton>
                        }
                    >
                        <AccentFooterButton
                            icon={<DesktopIcon fill="currentColor" />}
                            lowerIcon
                            onClick={onFooterClickDesktop}
                            data-tc-connection-accent-button="true"
                        >
                            <Show
                                when={!opensInTelegram()}
                                fallback={
                                    <Translation translationKey="walletModal.desktopConnectionModal.openInTelegramDesktop">
                                        Open in Telegram Desktop
                                    </Translation>
                                }
                            >
                                <Translation
                                    translationKey="walletModal.desktopConnectionModal.openDesktop"
                                    translationValues={{ name: walletName() }}
                                >
                                    Open {walletName()} Desktop
                                </Translation>
                            </Show>
                        </AccentFooterButton>
                    </Show>
                </Show>
            </BottomButtonsContainerStyled>
        </DesktopConnectionModalStyled>
    );
};

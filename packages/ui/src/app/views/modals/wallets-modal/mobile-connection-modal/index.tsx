import {
    ConnectAdditionalRequest,
    isTelegramUrl,
    WalletInfoRemote,
    WalletWrongNetworkError,
    WalletMissingRequiredFeaturesError,
    checkRequiredWalletFeatures
} from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createSignal,
    Match,
    onCleanup,
    Show,
    Switch,
    useContext
} from 'solid-js';
import {
    BodyStyled,
    BodyTextStyled,
    StatusTextStyled,
    ButtonsContainerStyled,
    FooterButton,
    FooterStyled,
    H1Styled,
    ImageStyled,
    WalletStatusIconStyled,
    MobileConnectionModalStyled,
    StatusStyled,
    StyledIconButton
} from './style';
import { Crossfade } from 'src/app/components/crossfade';
import { ConnectorContext } from 'src/app/state/connector.context';
import { Button, H3, Link, LinkIcon, QRIcon, RetryIcon } from 'src/app/components';
import { buttonBlue } from 'src/app/components/button/style';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { useTheme } from 'solid-styled-components';
import { MobileConnectionQR } from 'src/app/views/modals/wallets-modal/mobile-connection-modal/mobile-connection-qr';
import { Translation } from 'src/app/components/typography/Translation';
import {
    redirectToTelegram,
    redirectToWallet,
    removeEmbeddedRequestFromUniversalLink
} from 'src/app/utils/url-strategy-helpers';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { WalletsModalState } from 'src/models';
import { logDebug } from 'src/app/utils/log';
import { TELEGRAM_WALLET_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';
import { stripWalletNameNote } from 'src/app/utils/wallets';

export interface MobileConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote;
    walletsModalState?: WalletsModalState;
    onBackClick: () => void;
    backDisabled?: boolean;
    defaultError?: 'missing-features' | 'connection-declined' | 'not-supported' | null;
}

export const MobileConnectionModal: Component<MobileConnectionProps> = props => {
    /** The wallet's name as this screen shows it, without a note such as Walt's "(ex. Wallet)". */
    const walletName = (): string => stripWalletNameNote(props.wallet.name);
    const theme = useTheme();
    const [firstClick, setFirstClick] = createSignal(true);
    const [showQR, setShowQR] = createSignal(false);
    const [connectionErrored, setConnectionErrored] = createSignal<
        'missing-features' | 'connection-declined' | 'not-supported' | 'wrong-network' | null
    >(null);

    createEffect(() => {
        setConnectionErrored(props.defaultError ?? null);
    });
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

            setConnectionErrored(null);
        }
    );

    const [universalLink, setUniversalLink] = createSignal<string | null>(null);

    const getUniversalLink = (consume: boolean): string => {
        let link = universalLink();
        let wasEmpty = !link;

        if (!link) {
            const hasEmbeddedRequestFeature = checkRequiredWalletFeatures(
                props.wallet.features ?? [],
                { embeddedRequest: {} }
            );

            const embeddedRequest =
                hasEmbeddedRequestFeature &&
                props.walletsModalState &&
                'embeddedRequest' in props.walletsModalState
                    ? props.walletsModalState.embeddedRequest
                    : undefined;

            link = connector.connect(
                {
                    universalLink: props.wallet.universalLink,
                    bridgeUrl: props.wallet.bridgeUrl
                },
                props.additionalRequest,
                {
                    traceId: props.walletsModalState?.traceId,
                    embeddedRequest: embeddedRequest ?? undefined
                }
            );
        }

        const linkWithoutRequest = removeEmbeddedRequestFromUniversalLink(link);

        const linkToStore = consume ? linkWithoutRequest : link;
        const linkToReturn = consume ? link : linkWithoutRequest;

        const wasConsumed = linkToReturn !== linkToStore;
        if (wasConsumed || wasEmpty) {
            setUniversalLink(linkToStore);
        }

        logDebug('getUniversalLink', linkToReturn);

        return linkToReturn;
    };

    const onClickTelegram = (universalLink: string): void => {
        const alwaysForceRedirect = true;
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        redirectToTelegram(universalLink, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
            forceRedirect: alwaysForceRedirect
        });
    };

    const onRetry = (): void => {
        const currentUniversalLink = getUniversalLink(true);
        if (isTelegramUrl(currentUniversalLink)) {
            return onClickTelegram(currentUniversalLink);
        }

        setConnectionErrored(null);

        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToWallet(
            currentUniversalLink,
            props.wallet.deepLink,
            {
                returnStrategy: appState.returnStrategy,
                forceRedirect: forceRedirect
            },
            (method: 'universal-link' | 'custom-deeplink') => {
                setLastSelectedWalletInfo({
                    ...props.wallet,
                    openMethod: method
                });
            }
        );
    };

    const [isCopiedShown, setIsCopiedShown] = createSignal<
        ReturnType<typeof setTimeout> | undefined
    >(undefined);

    const onCopy = async (): Promise<void> => {
        if (isCopiedShown() !== undefined) {
            clearTimeout(isCopiedShown());
        }

        await copyToClipboard(getUniversalLink(false));
        const timeoutId = setTimeout(() => setIsCopiedShown(undefined), 1500);
        setIsCopiedShown(timeoutId);
    };

    const onOpenQR = (): void => {
        setConnectionErrored(null);
        setShowQR(true);
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'qrcode'
        });
    };

    const onCloseQR = (): void => {
        setShowQR(false);
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
    };

    const onBack = (): void => {
        if (showQR()) {
            onCloseQR();
        } else {
            props.onBackClick();
        }
    };

    onCleanup(unsubscribe);
    onRetry();

    return (
        <MobileConnectionModalStyled data-tc-wallets-modal-connection-mobile="true">
            <Show when={!props.backDisabled || showQR()}>
                <StyledIconButton icon="arrow" onClick={onBack} />
            </Show>
            <Crossfade>
                <Show
                    when={!showQR()}
                    fallback={
                        <div>
                            <MobileConnectionQR
                                universalLink={getUniversalLink(false)}
                                walletInfo={props.wallet}
                                onOpenLink={onRetry}
                                onCopy={onCopy}
                                isCopiedShown={isCopiedShown()}
                            />
                        </div>
                    }
                >
                    <div>
                        <H1Styled>{walletName()}</H1Styled>

                        <BodyStyled>
                            <Crossfade>
                                <Show
                                    when={connectionErrored()}
                                    fallback={
                                        <StatusStyled>
                                            <WalletStatusIconStyled
                                                src={props.wallet.imageUrl}
                                                status="waiting"
                                                round={
                                                    props.wallet.appName ===
                                                    TELEGRAM_WALLET_APP_NAME
                                                }
                                            />
                                            <BodyTextStyled
                                                translationKey="walletModal.mobileConnectionModal.continueIn"
                                                translationValues={{ name: walletName() }}
                                            >
                                                Continue in {walletName()}…
                                            </BodyTextStyled>
                                            <ButtonsContainerStyled>
                                                <Button
                                                    leftIcon={
                                                        <RetryIcon fill={buttonBlue(theme)} />
                                                    }
                                                    onClick={onRetry}
                                                >
                                                    <Translation translationKey="common.retry">
                                                        Retry
                                                    </Translation>
                                                </Button>
                                                <Button
                                                    leftIcon={<QRIcon fill={buttonBlue(theme)} />}
                                                    onClick={onOpenQR}
                                                >
                                                    <Translation translationKey="walletModal.mobileConnectionModal.showQR">
                                                        Show QR Code
                                                    </Translation>
                                                </Button>
                                            </ButtonsContainerStyled>
                                        </StatusStyled>
                                    }
                                >
                                    <StatusStyled>
                                        <WalletStatusIconStyled
                                            src={props.wallet.imageUrl}
                                            status="error"
                                            round={
                                                props.wallet.appName === TELEGRAM_WALLET_APP_NAME
                                            }
                                        />

                                        <Switch>
                                            <Match
                                                when={connectionErrored() === 'missing-features'}
                                            >
                                                <StatusTextStyled
                                                    translationKey="walletModal.mobileConnectionModal.missingFeatures"
                                                    translationValues={{ name: walletName() }}
                                                >
                                                    Please update Wallet, your version does not
                                                    support required features for this dApp
                                                </StatusTextStyled>
                                            </Match>
                                            <Match
                                                when={connectionErrored() === 'connection-declined'}
                                            >
                                                <StatusTextStyled translationKey="walletModal.mobileConnectionModal.connectionDeclined">
                                                    Connection declined
                                                </StatusTextStyled>
                                            </Match>
                                            <Match when={connectionErrored() === 'wrong-network'}>
                                                <StatusTextStyled
                                                    translationKey="walletModal.mobileConnectionModal.wrongNetwork"
                                                    translationValues={{ name: walletName() }}
                                                >
                                                    Connected wallet is on a different network.
                                                    Please switch network in {walletName()} and try
                                                    again.
                                                </StatusTextStyled>
                                            </Match>
                                            <Match when={connectionErrored() === 'not-supported'}>
                                                <StatusTextStyled
                                                    translationKey="walletModal.mobileConnectionModal.notSupportedWallet"
                                                    translationValues={{ name: walletName() }}
                                                >
                                                    {walletName()} doesn't support the requested
                                                    action. Please connect another wallet that
                                                    supports it.
                                                </StatusTextStyled>
                                            </Match>
                                        </Switch>
                                        <ButtonsContainerStyled>
                                            <Switch>
                                                <Match
                                                    when={
                                                        connectionErrored() === 'missing-features'
                                                    }
                                                >
                                                    <Button
                                                        appearance="filled"
                                                        leftIcon={
                                                            <RetryIcon
                                                                fill={
                                                                    theme.colors.connectButton
                                                                        .foreground
                                                                }
                                                            />
                                                        }
                                                        onClick={onRetry}
                                                    >
                                                        <Translation translationKey="common.retry">
                                                            Retry
                                                        </Translation>
                                                    </Button>
                                                    <Link href={props.wallet.aboutUrl} blank>
                                                        <Button leftIcon={<LinkIcon />}>
                                                            <Translation
                                                                translationKey="walletModal.mobileConnectionModal.updateWallet"
                                                                translationValues={{
                                                                    name: walletName()
                                                                }}
                                                            >
                                                                Update {walletName()}
                                                            </Translation>
                                                        </Button>
                                                    </Link>
                                                </Match>
                                                <Match
                                                    when={connectionErrored() === 'not-supported'}
                                                >
                                                    <Button
                                                        appearance="filled"
                                                        onClick={() => props.onBackClick()}
                                                    >
                                                        <Translation translationKey="walletModal.mobileConnectionModal.chooseAnotherWallet">
                                                            Choose Another Wallet
                                                        </Translation>
                                                    </Button>
                                                </Match>
                                                <Match
                                                    when={connectionErrored() === 'wrong-network'}
                                                >
                                                    <Button
                                                        appearance="filled"
                                                        leftIcon={
                                                            <RetryIcon
                                                                fill={
                                                                    theme.colors.connectButton
                                                                        .foreground
                                                                }
                                                            />
                                                        }
                                                        onClick={onRetry}
                                                    >
                                                        <Translation translationKey="common.retry">
                                                            Retry
                                                        </Translation>
                                                    </Button>
                                                </Match>
                                                <Match
                                                    when={
                                                        connectionErrored() ===
                                                        'connection-declined'
                                                    }
                                                >
                                                    <Button
                                                        appearance="filled"
                                                        leftIcon={
                                                            <RetryIcon
                                                                fill={
                                                                    theme.colors.connectButton
                                                                        .foreground
                                                                }
                                                            />
                                                        }
                                                        onClick={onRetry}
                                                    >
                                                        <Translation translationKey="common.retry">
                                                            Retry
                                                        </Translation>
                                                    </Button>
                                                    <Button
                                                        leftIcon={
                                                            <QRIcon fill={buttonBlue(theme)} />
                                                        }
                                                        onClick={onOpenQR}
                                                    >
                                                        <Translation translationKey="walletModal.mobileConnectionModal.showQR">
                                                            Show QR Code
                                                        </Translation>
                                                    </Button>
                                                </Match>
                                            </Switch>
                                        </ButtonsContainerStyled>
                                    </StatusStyled>
                                </Show>
                            </Crossfade>
                        </BodyStyled>

                        <FooterStyled>
                            <ImageStyled src={props.wallet.imageUrl} />
                            <H3>{walletName()}</H3>
                            <FooterButton href={props.wallet.aboutUrl} blank>
                                <Button appearance="plain">
                                    <Translation translationKey="common.get">Get</Translation>
                                </Button>
                            </FooterButton>
                        </FooterStyled>
                    </div>
                </Show>
            </Crossfade>
        </MobileConnectionModalStyled>
    );
};

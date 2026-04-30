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
    ButtonsContainerStyled,
    ErrorIconStyled,
    FooterButton,
    FooterStyled,
    H1Styled,
    ImageStyled,
    LoaderStyled,
    MobileConnectionModalStyled,
    StyledIconButton
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import { Button, H3, Link, LinkIcon, QRIcon, RetryIcon } from 'src/app/components';
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

export interface MobileConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote;
    walletsModalState?: WalletsModalState;
    onBackClick: () => void;
    backDisabled?: boolean;
    defaultError?: 'missing-features' | 'connection-declined' | 'not-supported' | null;
}

export const MobileConnectionModal: Component<MobileConnectionProps> = props => {
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
            <Show when={showQR()}>
                <MobileConnectionQR
                    universalLink={getUniversalLink(false)}
                    walletInfo={props.wallet}
                    onOpenLink={onRetry}
                    onCopy={onCopy}
                    isCopiedShown={isCopiedShown()}
                />
            </Show>
            <Show when={!showQR()}>
                <H1Styled>{props.wallet.name}</H1Styled>

                <BodyStyled>
                    <Show when={connectionErrored()}>
                        <ErrorIconStyled size="s" />

                        <Switch>
                            <Match when={connectionErrored() === 'missing-features'}>
                                <BodyTextStyled
                                    translationKey="walletModal.mobileConnectionModal.missingFeatures"
                                    translationValues={{ name: props.wallet.name }}
                                >
                                    Please update Wallet, your version does not support required
                                    features for this dApp
                                </BodyTextStyled>
                            </Match>
                            <Match when={connectionErrored() === 'connection-declined'}>
                                <BodyTextStyled translationKey="walletModal.mobileConnectionModal.connectionDeclined">
                                    Connection declined
                                </BodyTextStyled>
                            </Match>
                            <Match when={connectionErrored() === 'wrong-network'}>
                                <BodyTextStyled
                                    translationKey="walletModal.mobileConnectionModal.wrongNetwork"
                                    translationValues={{ name: props.wallet.name }}
                                >
                                    Connected wallet is on a different network. Please switch
                                    network in {props.wallet.name} and try again.
                                </BodyTextStyled>
                            </Match>
                            <Match when={connectionErrored() === 'not-supported'}>
                                <BodyTextStyled
                                    translationKey="walletModal.mobileConnectionModal.notSupportedWallet"
                                    translationValues={{ name: props.wallet.name }}
                                >
                                    {props.wallet.name} doesn't support the requested action. Please
                                    connect another wallet that supports it.
                                </BodyTextStyled>
                            </Match>
                        </Switch>
                        <ButtonsContainerStyled>
                            <Switch>
                                <Match when={connectionErrored() === 'missing-features'}>
                                    <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                                        <Translation translationKey="common.retry">
                                            Retry
                                        </Translation>
                                    </Button>
                                    <Link href={props.wallet.aboutUrl} blank>
                                        <Button leftIcon={<LinkIcon />}>
                                            <Translation
                                                translationKey="walletModal.mobileConnectionModal.updateWallet"
                                                translationValues={{ name: props.wallet.name }}
                                            >
                                                Update {props.wallet.name}
                                            </Translation>
                                        </Button>
                                    </Link>
                                </Match>
                                <Match when={connectionErrored() === 'not-supported'}>
                                    <Button onClick={() => props.onBackClick()}>
                                        <Translation translationKey="walletModal.mobileConnectionModal.chooseAnotherWallet">
                                            Choose Another Wallet
                                        </Translation>
                                    </Button>
                                </Match>
                                <Match when={connectionErrored() === 'wrong-network'}>
                                    <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                                        <Translation translationKey="common.retry">
                                            Retry
                                        </Translation>
                                    </Button>
                                </Match>
                                <Match when={connectionErrored() === 'connection-declined'}>
                                    <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                                        <Translation translationKey="common.retry">
                                            Retry
                                        </Translation>
                                    </Button>
                                    <Button
                                        leftIcon={<QRIcon fill={theme.colors.accent} />}
                                        onClick={onOpenQR}
                                    >
                                        <Translation translationKey="walletModal.mobileConnectionModal.showQR">
                                            Show QR Code
                                        </Translation>
                                    </Button>
                                </Match>
                            </Switch>
                        </ButtonsContainerStyled>
                    </Show>
                    <Show when={!connectionErrored()}>
                        <LoaderStyled size="s" />
                        <BodyTextStyled
                            translationKey="walletModal.mobileConnectionModal.continueIn"
                            translationValues={{ name: props.wallet.name }}
                        >
                            Continue in {props.wallet.name}…
                        </BodyTextStyled>
                        <ButtonsContainerStyled>
                            <Button leftIcon={<RetryIcon />} onClick={onRetry}>
                                <Translation translationKey="common.retry">Retry</Translation>
                            </Button>
                            <Button
                                leftIcon={<QRIcon fill={theme.colors.accent} />}
                                onClick={onOpenQR}
                            >
                                <Translation translationKey="walletModal.mobileConnectionModal.showQR">
                                    Show QR Code
                                </Translation>
                            </Button>
                        </ButtonsContainerStyled>
                    </Show>
                </BodyStyled>

                <FooterStyled>
                    <ImageStyled src={props.wallet.imageUrl} />
                    <H3>{props.wallet.name}</H3>
                    <FooterButton href={props.wallet.aboutUrl} blank>
                        <Button>
                            <Translation translationKey="common.get">GET</Translation>
                        </Button>
                    </FooterButton>
                </FooterStyled>
            </Show>
        </MobileConnectionModalStyled>
    );
};

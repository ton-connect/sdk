import {
    ConnectAdditionalRequest,
    isWalletInfoCurrentlyInjected,
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
    ButtonsContainerStyled,
    DesktopConnectionModalStyled,
    ErrorIconStyled,
    FooterButton,
    H1Styled,
    H2Styled,
    LoaderStyled,
    StyledIconButton
} from './style';
import { ConnectorContext } from 'src/app/state/connector.context';
import {
    BrowserIcon,
    Button,
    DesktopIcon,
    LinkIcon,
    LoaderIcon,
    MobileIcon,
    QRCode,
    RetryIcon
} from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { addReturnStrategy, openLinkBlank } from 'src/app/utils/web-api';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { Link } from 'src/app/components/link';
import { supportsDesktop, supportsExtension, supportsMobile } from 'src/app/utils/wallets';

export interface DesktopConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote | (WalletInfoRemote & WalletInfoInjectable);
    onBackClick: () => void;
}

export const DesktopConnectionModal: Component<DesktopConnectionProps> = props => {
    const [mode, setMode] = createSignal<'mobile' | 'desktop' | 'extension'>('mobile');
    const [connectionErrored, setConnectionErrored] = createSignal(false);
    const [universalLink, setUniversalLink] = createSignal<string | undefined>();
    const connector = useContext(ConnectorContext)!;

    const unsubscribe = connector.onStatusChange(
        () => {},
        () => {
            setConnectionErrored(true);
        }
    );

    onCleanup(unsubscribe);

    const generateUniversalLink = (): void => {
        setUniversalLink(
            connector.connect(
                {
                    universalLink: props.wallet.universalLink,
                    bridgeUrl: props.wallet.bridgeUrl
                },
                props.additionalRequest
            )
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
        setConnectionErrored(false);
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
        setConnectionErrored(false);
        if (mode() === 'extension') {
            generateUniversalLink();
        }

        setMode('desktop');
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        openLinkBlank(addReturnStrategy(universalLink()!, appState.returnStrategy));
    };

    const onClickExtension = (): void => {
        setConnectionErrored(false);
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
        <DesktopConnectionModalStyled data-tc-wallet-qr-modal-desktop="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1Styled>{props.wallet.name}</H1Styled>
            <Show when={mode() === 'mobile'}>
                <H2Styled
                    translationKey="walletModal.qrCodeModal.scan"
                    translationValues={{ name: props.wallet.name }}
                >
                    Scan QR code with your phone’s or {props.wallet.name}’s camera.
                </H2Styled>
            </Show>

            <BodyStyled qr={mode() === 'mobile'}>
                <Switch>
                    <Match when={mode() === 'mobile'}>
                        <QRCode
                            disableCopy={false}
                            sourceUrl={universalLink()!}
                            imageUrl={props.wallet.imageUrl}
                        />
                    </Match>
                    <Match when={connectionErrored()}>
                        <ErrorIconStyled size="s" />
                        <BodyTextStyled>Connection declined</BodyTextStyled>
                        <Button
                            icon={<RetryIcon />}
                            onClick={mode() === 'extension' ? onClickExtension : onClickDesktop}
                        >
                            Retry
                        </Button>
                    </Match>
                    <Match when={mode() === 'extension'}>
                        <Show when={isWalletInfoCurrentlyInjected(props.wallet)}>
                            <LoaderStyled size="m" />
                            <BodyTextStyled>
                                Continue in {props.wallet.name} browser extension…
                            </BodyTextStyled>
                            <Button icon={<RetryIcon />} onClick={onClickExtension}>
                                Retry
                            </Button>
                        </Show>
                        <Show when={!isWalletInfoCurrentlyInjected(props.wallet)}>
                            <BodyTextStyled>
                                Seems you don't have installed {props.wallet.name} browser extension
                            </BodyTextStyled>
                            <Link href={props.wallet.aboutUrl} blank>
                                <Button
                                    icon={<LinkIcon />}
                                    iconFloatRight
                                    onClick={onClickExtension}
                                >
                                    Get {props.wallet.name}
                                </Button>
                            </Link>
                        </Show>
                    </Match>
                    <Match when={mode() === 'desktop'}>
                        <LoaderIcon size="m" />
                        <BodyTextStyled>Continue in {props.wallet.name} on desktop…</BodyTextStyled>
                        <ButtonsContainerStyled>
                            <Button icon={<RetryIcon />} onClick={onClickDesktop}>
                                Retry
                            </Button>
                            <Link href={props.wallet.aboutUrl} blank>
                                <Button icon={<LinkIcon />} iconFloatRight>
                                    Get {props.wallet.name}
                                </Button>
                            </Link>
                        </ButtonsContainerStyled>
                    </Match>
                </Switch>
            </BodyStyled>

            <ButtonsContainerStyled>
                <Show when={mode() !== 'mobile' && supportsMobile(props.wallet)}>
                    <FooterButton
                        appearance="secondary"
                        icon={<MobileIcon />}
                        onClick={onClickMobile}
                        mt={false}
                    >
                        Mobile
                    </FooterButton>
                </Show>
                <Show when={mode() !== 'extension' && supportsExtension(props.wallet)}>
                    <FooterButton
                        appearance="secondary"
                        icon={<BrowserIcon />}
                        onClick={onClickExtension}
                        mt={mode() === 'mobile'}
                    >
                        Browser Extension
                    </FooterButton>
                </Show>
                <Show when={mode() !== 'desktop' && supportsDesktop(props.wallet)}>
                    <FooterButton
                        appearance="secondary"
                        icon={<DesktopIcon />}
                        onClick={onClickDesktop}
                        mt={mode() === 'mobile'}
                    >
                        Desktop
                    </FooterButton>
                </Show>
            </ButtonsContainerStyled>
        </DesktopConnectionModalStyled>
    );
};

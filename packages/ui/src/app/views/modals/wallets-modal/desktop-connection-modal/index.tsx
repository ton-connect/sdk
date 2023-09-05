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
    BottomButtonsContainerStyled,
    ButtonsContainerStyled,
    DesktopConnectionModalStyled,
    ErrorIconStyled,
    FooterButton,
    H1Styled,
    H2Styled,
    LoaderStyled, QRCodeStyled,
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
    QRCode,
    RetryIcon
} from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { addReturnStrategy, openLinkBlank } from 'src/app/utils/web-api';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { Link } from 'src/app/components/link';
import { supportsDesktop, supportsExtension, supportsMobile } from 'src/app/utils/wallets';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { IMG } from 'src/app/env/IMG';

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
            if (props.wallet.appName !== AT_WALLET_APP_NAME) {
                setConnectionErrored(true);
            }
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

    const onClickTelegram = (): void => {
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        openLinkBlank(universalLink()!);
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
                        <QRCodeStyled
                            disableCopy={false}
                            sourceUrl={universalLink()!}
                            imageUrl={props.wallet.imageUrl}
                        />
                    </Match>
                    <Match when={connectionErrored()}>
                        <ErrorIconStyled size="s" />
                        <BodyTextStyled>Connection declined</BodyTextStyled>
                        <ButtonsContainerStyled>
                            <Button
                                leftIcon={<RetryIcon />}
                                onClick={mode() === 'extension' ? onClickExtension : onClickDesktop}
                            >
                                Retry
                            </Button>
                        </ButtonsContainerStyled>
                    </Match>
                    <Match when={mode() === 'extension'}>
                        <Show when={isWalletInfoCurrentlyInjected(props.wallet)}>
                            <LoaderStyled size="s" />
                            <BodyTextStyled>
                                Continue in {props.wallet.name} browser extension…
                            </BodyTextStyled>
                            <ButtonsContainerStyled>
                                <Button leftIcon={<RetryIcon />} onClick={onClickExtension}>
                                    Retry
                                </Button>
                            </ButtonsContainerStyled>
                        </Show>
                        <Show when={!isWalletInfoCurrentlyInjected(props.wallet)}>
                            <BodyTextStyled>
                                Seems you don't have installed {props.wallet.name} browser extension
                            </BodyTextStyled>
                            <ButtonsContainerStyled>
                                <Link href={props.wallet.aboutUrl} blank>
                                    <Button rightIcon={<LinkIcon />} onClick={onClickExtension}>
                                        Get {props.wallet.name}
                                    </Button>
                                </Link>
                            </ButtonsContainerStyled>
                        </Show>
                    </Match>
                    <Match when={mode() === 'desktop'}>
                        <LoaderIcon size="m" />
                        <BodyTextStyled>Continue in {props.wallet.name} on desktop…</BodyTextStyled>
                        <ButtonsContainerStyled>
                            <Button leftIcon={<RetryIcon />} onClick={onClickDesktop}>
                                Retry
                            </Button>
                            <Link href={props.wallet.aboutUrl} blank>
                                <Button rightIcon={<LinkIcon />}>Get {props.wallet.name}</Button>
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
                    Open Wallet on Telegram on desktop
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
                            Mobile
                        </FooterButton>
                    </Show>
                    <Show when={mode() !== 'extension' && supportsExtension(props.wallet)}>
                        <FooterButton
                            appearance="secondary"
                            leftIcon={<BrowserIcon />}
                            onClick={onClickExtension}
                        >
                            Browser Extension
                        </FooterButton>
                    </Show>
                    <Show when={mode() !== 'desktop' && supportsDesktop(props.wallet)}>
                        <FooterButton
                            appearance="secondary"
                            leftIcon={<DesktopIcon />}
                            onClick={onClickDesktop}
                        >
                            Desktop
                        </FooterButton>
                    </Show>
                </BottomButtonsContainerStyled>
            </Show>
        </DesktopConnectionModalStyled>
    );
};

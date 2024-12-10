import { ConnectAdditionalRequest, isTelegramUrl, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, onCleanup, Show, useContext } from 'solid-js';
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
import { Button, H3, QRIcon, RetryIcon } from 'src/app/components';
import { appState } from 'src/app/state/app.state';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { useTheme } from 'solid-styled-components';
import { MobileConnectionQR } from 'src/app/views/modals/wallets-modal/mobile-connection-modal/mobile-connection-qr';
import { Translation } from 'src/app/components/typography/Translation';
import { redirectToTelegram, redirectToWallet } from 'src/app/utils/url-strategy-helpers';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';

export interface MobileConnectionProps {
    additionalRequest?: ConnectAdditionalRequest;
    wallet: WalletInfoRemote;
    onBackClick: () => void;
    backDisabled?: boolean;
}

export const MobileConnectionModal: Component<MobileConnectionProps> = props => {
    const theme = useTheme();
    const [firstClick, setFirstClick] = createSignal(true);
    const [showQR, setShowQR] = createSignal(false);
    const [connectionErrored, setConnectionErrored] = createSignal(false);
    const connector = useContext(ConnectorContext)!;

    const unsubscribe = connector.onStatusChange(
        () => {},
        () => {
            setConnectionErrored(true);
        }
    );

    const universalLink = createMemo(() =>
        connector.connect(
            {
                universalLink: props.wallet.universalLink,
                bridgeUrl: props.wallet.bridgeUrl
            },
            props.additionalRequest
        )
    );

    const onClickTelegram = (): void => {
        const alwaysForceRedirect = true;
        setLastSelectedWalletInfo({
            ...props.wallet,
            openMethod: 'universal-link'
        });
        redirectToTelegram(universalLink()!, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
            forceRedirect: alwaysForceRedirect
        });
    };

    const onRetry = (): void => {
        const currentUniversalLink = universalLink();
        if (isTelegramUrl(currentUniversalLink)) {
            return onClickTelegram();
        }

        setConnectionErrored(false);

        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToWallet(
            universalLink()!,
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

        await copyToClipboard(universalLink());
        const timeoutId = setTimeout(() => setIsCopiedShown(undefined), 1500);
        setIsCopiedShown(timeoutId);
    };

    const onOpenQR = (): void => {
        setConnectionErrored(false);
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
                    universalLink={universalLink()}
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
                        <BodyTextStyled translationKey="walletModal.mobileConnectionModal.connectionDeclined">
                            Connection declined
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

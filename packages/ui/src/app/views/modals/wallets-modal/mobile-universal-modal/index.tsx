import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { AtWalletIcon, Button, FourWalletsItem, QRIcon, WalletItem } from 'src/app/components';
import {
    H1Styled,
    H2Styled,
    StyledLeftActionButton,
    TelegramButtonStyled,
    TGImageStyled
} from './style';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { IMG } from 'src/app/env/IMG';
import { supportsMobile } from 'src/app/utils/wallets';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { TonConnectUIError } from 'src/errors';
import { MobileUniversalQR } from './mobile-universal-qr';
import { Translation } from 'src/app/components/typography/Translation';
import { redirectToTelegram, redirectToWallet } from 'src/app/utils/url-strategy-helpers';
import { bridgesIsEqual, getUniqueBridges } from 'src/app/utils/bridge';
import { WalletUlContainer } from 'src/app/components/wallet-item/style';

interface MobileUniversalModalProps {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;

    onSelect: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;

    primaryWalletId?: string;
}

export const MobileUniversalModal: Component<MobileUniversalModalProps> = props => {
    const [showQR, setShowQR] = createSignal(false);
    const [firstClick, setFirstClick] = createSignal(true);
    const [universalLink, setUniversalLink] = createSignal<string | null>(null);
    const connector = appState.connector;

    const primaryWallet = createMemo(() => {
        const primaryWalletId = props.primaryWalletId ?? AT_WALLET_APP_NAME;
        return props.walletsList.find(wallet => wallet.appName === primaryWalletId);
    });
    const primaryWalletValue = primaryWallet();

    const [showSecondaryWallets, setShowSecondaryWallets] = createSignal(
        primaryWalletValue === undefined
    );

    const walletsList = (): WalletInfo[] =>
        props.walletsList.filter(
            w => supportsMobile(w) && w.appName !== (props.primaryWalletId ?? AT_WALLET_APP_NAME)
        );

    const shouldShowMoreButton = (): boolean => walletsList().length > 7;

    const walletsBridges = createMemo(() => getUniqueBridges(props.walletsList), null, {
        equals: bridgesIsEqual
    });

    const getUniversalLink = (): string => {
        if (!universalLink()) {
            setUniversalLink(connector.connect(walletsBridges(), props.additionalRequest));
        }
        return universalLink()!;
    };

    setLastSelectedWalletInfo({ openMethod: 'universal-link' });

    const [isCopiedShown, setIsCopiedShown] = createSignal<
        ReturnType<typeof setTimeout> | undefined
    >(undefined);

    const onCopy = async (): Promise<void> => {
        if (isCopiedShown() !== undefined) {
            clearTimeout(isCopiedShown());
        }

        await copyToClipboard(getUniversalLink());
        const timeoutId = setTimeout(() => setIsCopiedShown(undefined), 1500);
        setIsCopiedShown(timeoutId);
    };

    const onSelectUniversal = (): void => {
        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToWallet(
            getUniversalLink(),
            undefined,
            {
                returnStrategy: appState.returnStrategy,
                forceRedirect: forceRedirect
            },
            (method: 'universal-link' | 'custom-deeplink') => {
                setLastSelectedWalletInfo({
                    openMethod: method
                });
            }
        );
    };

    const onPrimaryWallet = (): void => {
        setUniversalLink(null);

        // const atWallet = props.walletsList.find(wallet => wallet.appName === AT_WALLET_APP_NAME);
        if (!primaryWalletValue || !isWalletInfoRemote(primaryWalletValue)) {
            throw new TonConnectUIError('Selected wallet not found in the wallets list');
        }

        console.log('primaryWalletValue', primaryWalletValue);

        const walletLink = connector.connect(
            {
                bridgeUrl: primaryWalletValue.bridgeUrl,
                universalLink: primaryWalletValue.universalLink
            },
            props.additionalRequest
        );

        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToTelegram(walletLink, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl:
                primaryWalletValue.appName === AT_WALLET_APP_NAME
                    ? appState.twaReturnUrl
                    : undefined,
            forceRedirect: forceRedirect
        });
    };

    const onOpenQR = (): void => {
        setShowQR(true);
        setLastSelectedWalletInfo({
            openMethod: 'qrcode'
        });
    };

    const onCloseQR = (): void => {
        setShowQR(false);
        setLastSelectedWalletInfo({
            openMethod: 'universal-link'
        });
    };

    return (
        <div data-tc-wallets-modal-universal-mobile="true">
            <Show when={showQR()}>
                <StyledLeftActionButton icon="arrow" onClick={onCloseQR} />
                <MobileUniversalQR
                    universalLink={getUniversalLink()}
                    isCopiedShown={isCopiedShown()}
                    onOpenLink={onSelectUniversal}
                    onCopy={onCopy}
                />
            </Show>
            <Show when={!showQR()}>
                <StyledLeftActionButton icon={<QRIcon />} onClick={onOpenQR} />
                <H1Styled translationKey="walletModal.mobileUniversalModal.connectYourWallet">
                    Connect your TON wallet
                </H1Styled>
                <Show when={primaryWallet()}>
                    <H2Styled
                        translationKey="walletModal.mobileUniversalModal.openPrimaryWalletOrSelect"
                        translationValues={{ name: primaryWallet()!.name }}
                        maxWidth={320}
                    >
                        Open {primaryWallet()!.name} or select your wallet to connect
                    </H2Styled>
                </Show>
                <Show when={!primaryWallet()}>
                    <H2Styled
                        translationKey="walletModal.mobileUniversalModal.openPrimaryWalletOrSelect"
                        translationValues={{ name: primaryWallet()!.name }}
                        maxWidth={320}
                    >
                        Open {primaryWallet()!.name} or select your wallet to connect
                    </H2Styled>
                </Show>
                <TelegramButtonStyled
                    leftIcon={primaryWallet() ? <div style="width: 24px" /> : <AtWalletIcon />}
                    rightIcon={
                        <TGImageStyled src={primaryWallet() ? primaryWallet()!.imageUrl : IMG.TG} />
                    }
                    onClick={onPrimaryWallet}
                    scale="s"
                >
                    <Show when={primaryWallet()}>
                        <Translation
                            translationKey="walletModal.mobileUniversalModal.openWallet"
                            translationValues={{ name: primaryWallet()!.name }}
                        >
                            Open {primaryWallet()!.name}
                        </Translation>
                    </Show>
                    <Show when={!primaryWallet()}>
                        <Translation translationKey="walletModal.mobileUniversalModal.openWalletOnTelegram">
                            Connect Wallet in Telegram
                        </Translation>
                    </Show>
                </TelegramButtonStyled>
                <Show when={primaryWallet() && !showSecondaryWallets()}>
                    <div style="padding-bottom: 16px; display: flex; justify-content: center;">
                        <Button appearance="flat" onClick={() => setShowSecondaryWallets(true)}>
                            Other Options
                        </Button>
                    </div>
                </Show>
                <Show when={!primaryWallet()}>
                    <H2Styled
                        translationKey="walletModal.mobileUniversalModal.chooseOtherApplication"
                        maxWidth={342}
                        padding={'0 24px 8px 24px'}
                        margin={'0'}
                    >
                        Choose other application
                    </H2Styled>
                </Show>
                <Show when={showSecondaryWallets()}>
                    <WalletUlContainer>
                        <For
                            each={
                                shouldShowMoreButton() ? walletsList().slice(0, 3) : walletsList()
                            }
                        >
                            {wallet => (
                                <li>
                                    <WalletItem
                                        icon={wallet.imageUrl}
                                        name={wallet.name}
                                        onClick={() => props.onSelect(wallet)}
                                    />
                                </li>
                            )}
                        </For>
                        <Show when={shouldShowMoreButton()}>
                            <li>
                                <FourWalletsItem
                                    labelLine1="View all"
                                    labelLine2="wallets"
                                    images={walletsList()
                                        .slice(3, 7)
                                        .map(i => i.imageUrl)}
                                    onClick={() => props.onSelectAllWallets()}
                                />
                            </li>
                        </Show>
                    </WalletUlContainer>
                </Show>
            </Show>
        </div>
    );
};

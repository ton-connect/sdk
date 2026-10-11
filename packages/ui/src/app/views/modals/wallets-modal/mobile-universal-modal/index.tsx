import { ConnectAdditionalRequest } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { FourWalletsItem, QRIcon, TelegramIcon, WalletItem } from 'src/app/components';
import {
    ButtonWalletIconStyled,
    GramWalletButtonStyled,
    H1Styled,
    H2Styled,
    StyledLeftActionButton,
    TelegramButtonStyled,
    TelegramDiamondStyled,
    TelegramH1Styled
} from './style';
import { setLastSelectedWalletInfo, setLastVisibleWalletsInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { supportsMobile } from 'src/app/utils/wallets';
import { GRAM_WALLET_APP_NAME, TELEGRAM_WALLET_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { MobileUniversalQR } from './mobile-universal-qr';
import { Translation } from 'src/app/components/typography/Translation';
import {
    redirectToWallet,
    removeEmbeddedRequestFromUniversalLink
} from 'src/app/utils/url-strategy-helpers';
import { bridgesIsEqual, getUniqueBridges } from 'src/app/utils/bridge';
import { WalletUlContainer } from 'src/app/components/wallet-item/style';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { WalletsModalState } from 'src/models';
import { logDebug } from 'src/app/utils/log';

const DIAMOND_SIZE = 120;

interface MobileUniversalModalProps {
    walletsList: UIWalletInfo[];

    additionalRequest: ConnectAdditionalRequest;

    walletModalState: WalletsModalState;

    onSelect: (walletInfo: UIWalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const MobileUniversalModal: Component<MobileUniversalModalProps> = props => {
    const [showQR, setShowQR] = createSignal(false);
    const [firstClick, setFirstClick] = createSignal(true);
    const [universalLink, setUniversalLink] = createSignal<string | null>(null);
    const connector = appState.connector;
    /** Wallets promoted to their own button above the row, and so kept out of it. */
    const shortcutAppNames = [TELEGRAM_WALLET_APP_NAME, GRAM_WALLET_APP_NAME];

    const walletsList = (): UIWalletInfo[] =>
        props.walletsList.filter(w => supportsMobile(w) && !shortcutAppNames.includes(w.appName));
    const shouldShowMoreButton = (): boolean => walletsList().length > 7;

    /** A promoted wallet is only offered when it is actually connectable from this screen. */
    const shortcutWallet = (appName: string): UIWalletInfo | null =>
        props.walletsList.find(
            wallet =>
                wallet.appName === appName &&
                supportsMobile(wallet) &&
                wallet.isSupportRequiredFeatures
        ) ?? null;

    const telegramWallet = createMemo(() => shortcutWallet(TELEGRAM_WALLET_APP_NAME), null);
    const gramWallet = createMemo(() => shortcutWallet(GRAM_WALLET_APP_NAME), null);
    const hasShortcut = (): boolean => !!telegramWallet() || !!gramWallet();

    const walletsBridges = createMemo(() => getUniqueBridges(props.walletsList), null, {
        equals: bridgesIsEqual
    });

    const getUniversalLink = (options: { useEmbeddedRequest: boolean }): string => {
        let link = universalLink();
        let wasEmpty = !link;

        if (!link) {
            const embeddedRequest =
                'embeddedRequest' in props.walletModalState
                    ? props.walletModalState.embeddedRequest
                    : undefined;

            // Only rendering the QR can fill the cache: Open Link and Copy Link are buttons on
            // that screen. Opening the link is reported by onSelectUniversal.
            link = connector.connect(walletsBridges(), props.additionalRequest, {
                traceId: props.walletModalState.traceId,
                embeddedRequest: embeddedRequest ?? undefined,
                linkDisplayOnly: true
            });
        }

        const linkWithoutRequest = removeEmbeddedRequestFromUniversalLink(link);

        const linkToStore = options.useEmbeddedRequest ? linkWithoutRequest : link;
        const linkToReturn = options.useEmbeddedRequest ? link : linkWithoutRequest;

        const wasConsumed = linkToReturn !== linkToStore;
        if (wasConsumed || wasEmpty) {
            setUniversalLink(linkToStore);
        }

        logDebug('getUniversalLink', linkToReturn);

        return linkToReturn;
    };

    setLastSelectedWalletInfo({ openMethod: 'universal-link' });

    const [isCopiedShown, setIsCopiedShown] = createSignal<
        ReturnType<typeof setTimeout> | undefined
    >(undefined);

    const onCopy = async (): Promise<void> => {
        if (isCopiedShown() !== undefined) {
            clearTimeout(isCopiedShown());
        }

        await copyToClipboard(getUniversalLink({ useEmbeddedRequest: false }));
        const timeoutId = setTimeout(() => setIsCopiedShown(undefined), 1500);
        setIsCopiedShown(timeoutId);
    };

    const onSelectUniversal = (): void => {
        // The link was reported as display-only when the QR built it; opening it is the
        // initiation, and the universal `tc://` link is answered by any wallet.
        appState.tracker.trackConnectionInitiated(
            { kind: 'http-any-wallet' },
            props.walletModalState.traceId
        );

        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToWallet(
            getUniversalLink({ useEmbeddedRequest: true }),
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

    const supportedWallets = createMemo(
        () => walletsList().filter(wallet => wallet.isSupportRequiredFeatures),
        null
    );

    const visibleWallets = createMemo(() => supportedWallets().slice(0, 3), null);
    setLastVisibleWalletsInfo({
        walletsMenu: 'main_screen',
        wallets: [telegramWallet(), gramWallet(), ...visibleWallets()].filter(
            (wallet): wallet is UIWalletInfo => !!wallet
        )
    });

    const fourWalletsItem = createMemo(
        () =>
            walletsList()
                .filter(wallet => !visibleWallets().find(w => w.appName === wallet.appName))
                .slice(0, 4),
        null
    );

    return (
        <div data-tc-wallets-modal-universal-mobile="true">
            <Show when={showQR()}>
                <StyledLeftActionButton icon="arrow" onClick={onCloseQR} />
                <MobileUniversalQR
                    universalLink={getUniversalLink({ useEmbeddedRequest: false })}
                    isCopiedShown={isCopiedShown()}
                    onOpenLink={onSelectUniversal}
                    onCopy={onCopy}
                />
            </Show>
            <Show when={!showQR()}>
                <StyledLeftActionButton icon={<QRIcon />} onClick={onOpenQR} />
                <Show
                    when={telegramWallet()}
                    fallback={
                        <H1Styled translationKey="walletModal.mobileUniversalModal.connectYourWallet">
                            Connect your TON wallet
                        </H1Styled>
                    }
                >
                    <TelegramDiamondStyled size={DIAMOND_SIZE} />
                    <TelegramH1Styled translationKey="walletModal.mobileUniversalModal.useTelegramWallet">
                        Use your Telegram wallet
                    </TelegramH1Styled>
                    <TelegramButtonStyled
                        icon={<TelegramIcon />}
                        onClick={() => props.onSelect(telegramWallet()!)}
                    >
                        <Translation translationKey="common.connectTelegram">
                            Connect Telegram
                        </Translation>
                    </TelegramButtonStyled>
                </Show>
                <Show when={gramWallet()}>
                    <GramWalletButtonStyled
                        transparent={gramWallet()!.ui?.isButtonTransparent}
                        icon={<ButtonWalletIconStyled src={gramWallet()!.imageUrl} />}
                        onClick={() => props.onSelect(gramWallet()!)}
                    >
                        {gramWallet()!.name}
                    </GramWalletButtonStyled>
                </Show>
                <H2Styled
                    translationKey={
                        hasShortcut()
                            ? 'walletModal.mobileUniversalModal.chooseOtherApplication'
                            : 'walletModal.mobileUniversalModal.chooseApplication'
                    }
                    maxWidth={342}
                    padding={'0 24px 8px 24px'}
                    margin={'0'}
                >
                    {hasShortcut() ? 'Or choose another app:' : 'Choose an app:'}
                </H2Styled>
                <WalletUlContainer>
                    <For each={shouldShowMoreButton() ? visibleWallets() : supportedWallets()}>
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
                                images={fourWalletsItem().map(i => i.imageUrl)}
                                onClick={() => props.onSelectAllWallets()}
                            />
                        </li>
                    </Show>
                </WalletUlContainer>
            </Show>
        </div>
    );
};

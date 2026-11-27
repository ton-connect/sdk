import { ConnectAdditionalRequest } from '@tonconnect/sdk';
import {
    Component,
    createEffect,
    createMemo,
    createSignal,
    createUniqueId,
    For,
    Show
} from 'solid-js';
import { ArrowIcon, FourWalletsItem, QRIcon, TelegramIcon, WalletItem } from 'src/app/components';
import {
    ButtonWalletIconStyled,
    GramWalletButtonStyled,
    OtherWalletsToggleStyled,
    ToggleChevronStyled,
    ToggleWalletImageStyled,
    ToggleWalletsStyled,
    H1Styled,
    H2Styled,
    StyledLeftActionButton,
    TelegramButtonStyled,
    TelegramDiamondStyled,
    TelegramH1Styled
} from './style';
import { setLastSelectedWalletInfo, setLastVisibleWalletsInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { orderWalletsByRank, supportsMobile } from 'src/app/utils/wallets';
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
import { useI18n } from '@solid-primitives/i18n';
import { useTheme } from 'solid-styled-components';
import { animate } from 'src/app/utils/animate';
import { getWindow } from 'src/app/utils/web-api';
import { Transition } from 'solid-transition-group';
import { Crossfade } from 'src/app/components/crossfade';
import { EASE_STANDARD, RESIZE_DURATION } from 'src/app/styles/motion';

const DIAMOND_SIZE = 120;
// Gram Wallet shines together with the Telegram button, fainter
const GRAM_WALLET_SHINE_OPACITY = 0.085;

interface MobileUniversalModalProps {
    walletsList: UIWalletInfo[];

    additionalRequest: ConnectAdditionalRequest;

    walletModalState: WalletsModalState;

    onSelect: (walletInfo: UIWalletInfo) => void;

    onSelectAllWallets: () => void;

    /**
     * Whether the folded wallets row is open. The modal keeps it, so the row stays open while the
     * user visits another screen of the modal and comes back; without it, this screen keeps it.
     */
    rowUnfolded?: boolean;

    onRowUnfoldedChange?: (unfolded: boolean) => void;
}

const prefersReducedMotion = (): boolean =>
    !!getWindow()?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The unfolded wallets come in from under the toggle as the sheet grows to fit them, at the same
 * time as the toggle's icons fold away.
 */
function unfold(el: Element, done: () => void): void {
    if (prefersReducedMotion()) {
        done();
        return;
    }

    animate(
        el,
        [
            { opacity: 0, transform: 'translateY(-12px)' },
            { opacity: 1, transform: 'none' }
        ],
        { duration: RESIZE_DURATION, easing: EASE_STANDARD }
    ).finished.then(done, done);
}

/**
 * Folding back, everything moves at once: the toggle's icons return, the wallets fade out under
 * it, and the sheet shrinks. The wallets leave the layout as they start to fade, so the sheet
 * begins shrinking straight away instead of after them, and they fade where they were.
 */
function fold(el: Element, done: () => void): void {
    if (prefersReducedMotion() || !(el instanceof HTMLElement)) {
        done();
        return;
    }

    // The tiles are on their way out: no focus or screen reader should land on them meanwhile
    el.setAttribute('inert', '');

    const { offsetTop, offsetLeft, offsetWidth } = el;
    Object.assign(el.style, {
        position: 'absolute',
        top: `${offsetTop}px`,
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
        pointerEvents: 'none'
    });

    animate(
        el,
        [
            { opacity: 1, transform: 'none' },
            { opacity: 0, transform: 'translateY(-12px)' }
        ],
        { duration: 260, easing: EASE_STANDARD, fill: 'forwards' }
    ).finished.then(done, done);
}

export const MobileUniversalModal: Component<MobileUniversalModalProps> = props => {
    const [t] = useI18n();
    const theme = useTheme();
    const [showQR, setShowQR] = createSignal(false);
    const [firstClick, setFirstClick] = createSignal(true);
    const [universalLink, setUniversalLink] = createSignal<string | null>(null);
    const connector = appState.connector;
    /** Wallets promoted to their own button above the row, and so kept out of it. */
    const shortcutAppNames = (): string[] =>
        appState.withSecondaryButton
            ? [TELEGRAM_WALLET_APP_NAME, GRAM_WALLET_APP_NAME]
            : [TELEGRAM_WALLET_APP_NAME];

    const walletsList = (): UIWalletInfo[] =>
        props.walletsList.filter(w => supportsMobile(w) && !shortcutAppNames().includes(w.appName));
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
    const gramWallet = createMemo(
        () => (appState.withSecondaryButton ? shortcutWallet(GRAM_WALLET_APP_NAME) : null),
        null
    );
    const hasShortcut = (): boolean => !!telegramWallet() || !!gramWallet();

    /**
     * `isCompact` folds the row away under an "Other wallets" toggle, as long as a button above it
     * leaves the screen something to offer and the row has a tile to unfold. The row starts folded
     * whenever the modal is opened.
     */
    const isRowFoldable = (): boolean =>
        appState.isCompact &&
        hasShortcut() &&
        (supportedWallets().length > 0 || shouldShowMoreButton());
    const [ownRowUnfolded, setOwnRowUnfolded] = createSignal(false);
    const isRowUnfolded = (): boolean => props.rowUnfolded ?? ownRowUnfolded();
    const setIsRowUnfolded = (unfolded: boolean): void => {
        if (props.onRowUnfoldedChange) {
            props.onRowUnfoldedChange(unfolded);
        } else {
            setOwnRowUnfolded(unfolded);
        }
    };
    const isRowShown = (): boolean => !isRowFoldable() || isRowUnfolded();
    const rowId = createUniqueId();
    const toggleId = createUniqueId();

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
        () => orderWalletsByRank(walletsList().filter(wallet => wallet.isSupportRequiredFeatures)),
        null
    );

    const visibleWallets = createMemo(() => supportedWallets().slice(0, 3), null);
    /** The wallet tiles the row draws: the first ones before View all, or all of them. */
    const rowWallets = (): UIWalletInfo[] =>
        shouldShowMoreButton() ? visibleWallets() : supportedWallets();
    // The row tiles are only seen once the row is unfolded.
    createEffect(() =>
        setLastVisibleWalletsInfo({
            walletsMenu: 'main_screen',
            wallets: [telegramWallet(), gramWallet(), ...(isRowShown() ? rowWallets() : [])].filter(
                (wallet): wallet is UIWalletInfo => !!wallet
            )
        })
    );

    /**
     * The tile previews the wallets that follow the visible ones on All Wallets, which lists the
     * supported wallets first and the others after them, each by rank.
     */
    const fourWalletsItem = createMemo(
        () =>
            [
                ...supportedWallets(),
                ...orderWalletsByRank(
                    walletsList().filter(wallet => !wallet.isSupportRequiredFeatures)
                )
            ]
                .filter(wallet => !visibleWallets().find(w => w.appName === wallet.appName))
                .slice(0, 4),
        null
    );

    return (
        <div data-tc-wallets-modal-universal-mobile="true">
            <Crossfade>
                <Show
                    when={!showQR()}
                    fallback={
                        <div>
                            <StyledLeftActionButton icon="arrow" onClick={onCloseQR} />
                            <MobileUniversalQR
                                universalLink={getUniversalLink({ useEmbeddedRequest: false })}
                                isCopiedShown={isCopiedShown()}
                                onOpenLink={onSelectUniversal}
                                onCopy={onCopy}
                            />
                        </div>
                    }
                >
                    <div>
                        <StyledLeftActionButton
                            icon={<QRIcon fill={theme.colors.text.primary} />}
                            label={t(
                                'walletModal.mobileConnectionModal.showQR',
                                {},
                                'Show QR Code'
                            )}
                            onClick={onOpenQR}
                        />
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
                                shiny
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
                                afterTitle={!telegramWallet()}
                                transparent={gramWallet()!.ui?.isButtonTransparent}
                                shiny={!gramWallet()!.ui?.isButtonTransparent}
                                shineOpacity={GRAM_WALLET_SHINE_OPACITY}
                                icon={<ButtonWalletIconStyled src={gramWallet()!.imageUrl} />}
                                onClick={() => props.onSelect(gramWallet()!)}
                            >
                                {gramWallet()!.name}
                            </GramWalletButtonStyled>
                        </Show>
                        <Show when={isRowFoldable()}>
                            <OtherWalletsToggleStyled
                                id={toggleId}
                                type="button"
                                aria-expanded={isRowUnfolded()}
                                aria-controls={isRowUnfolded() ? rowId : undefined}
                                onClick={() => setIsRowUnfolded(!isRowUnfolded())}
                                data-tc-wallets-row-toggle="true"
                            >
                                <Show when={visibleWallets().length > 0}>
                                    <ToggleWalletsStyled open={isRowUnfolded()} aria-hidden="true">
                                        <For each={visibleWallets()}>
                                            {wallet => (
                                                <ToggleWalletImageStyled src={wallet.imageUrl} />
                                            )}
                                        </For>
                                    </ToggleWalletsStyled>
                                </Show>
                                <Translation translationKey="walletModal.mobileUniversalModal.otherWallets">
                                    Other wallets
                                </Translation>
                                <ToggleChevronStyled open={isRowUnfolded()} aria-hidden="true">
                                    <ArrowIcon direction="bottom" />
                                </ToggleChevronStyled>
                            </OtherWalletsToggleStyled>
                        </Show>
                        <Transition onEnter={unfold} onExit={fold}>
                            <Show when={isRowShown()}>
                                <div
                                    id={rowId}
                                    role={isRowFoldable() ? 'group' : undefined}
                                    aria-labelledby={isRowFoldable() ? toggleId : undefined}
                                >
                                    <Show when={!isRowFoldable()}>
                                        <H2Styled
                                            translationKey={
                                                hasShortcut()
                                                    ? 'walletModal.mobileUniversalModal.chooseOtherApplication'
                                                    : 'walletModal.mobileUniversalModal.chooseApplication'
                                            }
                                            maxWidth={342}
                                            padding={'0 24px'}
                                            margin={hasShortcut() ? '26px 0 0' : '0'}
                                        >
                                            {hasShortcut()
                                                ? 'Or choose another app:'
                                                : 'Choose an app:'}
                                        </H2Styled>
                                    </Show>
                                    <WalletUlContainer>
                                        <For each={rowWallets()}>
                                            {wallet => (
                                                <li>
                                                    <WalletItem
                                                        icon={wallet.imageUrl}
                                                        name={wallet.name}
                                                        glow={
                                                            wallet.appName === GRAM_WALLET_APP_NAME
                                                        }
                                                        shine={
                                                            wallet.appName === GRAM_WALLET_APP_NAME
                                                        }
                                                        onClick={() => props.onSelect(wallet)}
                                                    />
                                                </li>
                                            )}
                                        </For>
                                        <Show when={shouldShowMoreButton()}>
                                            <li>
                                                <FourWalletsItem
                                                    images={fourWalletsItem().map(i => i.imageUrl)}
                                                    onClick={() => props.onSelectAllWallets()}
                                                />
                                            </li>
                                        </Show>
                                    </WalletUlContainer>
                                </div>
                            </Show>
                        </Transition>
                    </div>
                </Show>
            </Crossfade>
        </div>
    );
};

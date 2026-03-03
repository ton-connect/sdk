import { ConnectAdditionalRequest, isWalletInfoRemote } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import { AtWalletIcon, FourWalletsItem, QRIcon, WalletItem } from 'src/app/components';
import {
    H1Styled,
    H2Styled,
    StyledLeftActionButton,
    TelegramButtonStyled,
    TGImageStyled
} from './style';
import {
    setLastSelectedWalletInfo,
    setLastVisibleWalletsInfo,
    walletsModalState
} from 'src/app/state/modals-state';
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
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { WalletsModalState } from 'src/models';
import { buildIntentLink } from 'src/app/utils/intent-link';

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
    const walletsList = (): UIWalletInfo[] =>
        props.walletsList.filter(w => supportsMobile(w) && w.appName !== AT_WALLET_APP_NAME);
    const shouldShowMoreButton = (): boolean => walletsList().length > 7;

    const walletsBridges = createMemo(() => getUniqueBridges(props.walletsList), null, {
        equals: bridgesIsEqual
    });

    const atWalletSupportFeatures = createMemo(
        () =>
            props.walletsList.find(wallet => wallet.appName === AT_WALLET_APP_NAME)
                ?.isSupportRequiredFeatures ?? false,
        null
    );

    const getUniversalLink = (): string => {
        // In intent mode we always use the prebuilt intent URL instead of connect URL.
        if (props.walletModalState.mode === 'intent') {
            const state = walletsModalState();
            const intent = state.intent!;
            const intentType = state.intentType!;

            const commonOptions = {
                traceId: props.walletModalState.traceId,
                connectRequest: props.additionalRequest
            };

            const link = buildIntentLink(
                connector,
                walletsBridges(),
                intentType,
                intent,
                commonOptions
            );

            setUniversalLink(link as string);
        }

        if (!universalLink()) {
            setUniversalLink(
                connector.connect(walletsBridges(), props.additionalRequest, {
                    traceId: props.walletModalState.traceId
                })
            );
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

    const onSelectTelegram = (): void => {
        setUniversalLink(null);

        const atWallet = props.walletsList.find(wallet => wallet.appName === AT_WALLET_APP_NAME);
        if (!atWallet || !isWalletInfoRemote(atWallet)) {
            throw new TonConnectUIError('@wallet bot not found in the wallets list');
        }

        const forceRedirect = !firstClick();
        setFirstClick(false);

        const link =
            props.walletModalState.mode === 'intent'
                ? (() => {
                      const state = walletsModalState();
                      const intent = state.intent!;
                      const intentType = state.intentType ?? 'signData';

                      const walletSource = {
                          bridgeUrl: atWallet.bridgeUrl,
                          universalLink: atWallet.universalLink
                      };

                      const commonOptions = {
                          traceId: props.walletModalState.traceId,
                          connectRequest: props.additionalRequest
                      };

                      return buildIntentLink(
                          connector,
                          walletSource,
                          intentType,
                          intent,
                          commonOptions
                      );
                  })()
                : connector.connect(
                      {
                          bridgeUrl: atWallet.bridgeUrl,
                          universalLink: atWallet.universalLink
                      },
                      props.additionalRequest,
                      { traceId: props.walletModalState.traceId }
                  );

        // TODO: fix types
        redirectToTelegram(link as string, {
            returnStrategy: appState.returnStrategy,
            twaReturnUrl: appState.twaReturnUrl,
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

    const supportedWallets = createMemo(
        () => walletsList().filter(wallet => wallet.isSupportRequiredFeatures),
        null
    );

    const visibleWallets = createMemo(() => supportedWallets().slice(0, 3), null);
    setLastVisibleWalletsInfo({
        walletsMenu: 'main_screen',
        wallets: atWalletSupportFeatures()
            ? [
                  props.walletsList.find(wallet => wallet.appName === AT_WALLET_APP_NAME)!,
                  ...visibleWallets()
              ]
            : visibleWallets()
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
                    universalLink={getUniversalLink()}
                    isCopiedShown={isCopiedShown()}
                    onOpenLink={onSelectUniversal}
                    onCopy={onCopy}
                />
            </Show>
            <Show when={!showQR()}>
                <StyledLeftActionButton icon={<QRIcon />} onClick={onOpenQR} />
                <H1Styled
                    translationKey={
                        props.walletModalState.mode === 'intent'
                            ? 'walletModal.mobileUniversalModal.intentTitle'
                            : 'walletModal.mobileUniversalModal.connectYourWallet'
                    }
                >
                    {props.walletModalState.mode === 'intent'
                        ? 'Prepare intent for your TON wallet'
                        : 'Connect your TON wallet'}
                </H1Styled>
                <Show when={atWalletSupportFeatures()}>
                    <H2Styled
                        translationKey="walletModal.mobileUniversalModal.openWalletOnTelegramOrSelect"
                        maxWidth={320}
                    >
                        Use Wallet in Telegram or choose other application
                    </H2Styled>
                    <TelegramButtonStyled
                        leftIcon={<AtWalletIcon />}
                        rightIcon={<TGImageStyled src={IMG.TG} />}
                        onClick={onSelectTelegram}
                        scale="s"
                    >
                        <Translation
                            translationKey={
                                props.walletModalState.mode === 'intent'
                                    ? 'walletModal.mobileUniversalModal.intentOpenWalletOnTelegram'
                                    : 'walletModal.mobileUniversalModal.openWalletOnTelegram'
                            }
                        >
                            {props.walletModalState.mode === 'intent'
                                ? 'Open Wallet in Telegram'
                                : 'Connect Wallet in Telegram'}
                        </Translation>
                    </TelegramButtonStyled>
                </Show>
                <H2Styled
                    translationKey="walletModal.mobileUniversalModal.chooseOtherApplication"
                    maxWidth={342}
                    padding={'0 24px 8px 24px'}
                    margin={'0'}
                >
                    Choose other application
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

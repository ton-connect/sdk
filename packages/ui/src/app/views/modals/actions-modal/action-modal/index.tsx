import {
    Component,
    createEffect,
    createMemo,
    createResource,
    createSignal,
    For,
    JSXElement,
    Show,
    useContext
} from 'solid-js';
import { Translation } from 'src/app/components/typography/Translation';
import {
    ActionModalStyled,
    ButtonStyled,
    H1Styled,
    IntentScanH2Styled,
    IntentWalletsH2Styled,
    LoaderButtonStyled,
    LoaderIconStyled,
    TextStyled
} from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { isTelegramUrl } from '@tonconnect/sdk';
import { isWalletInfoRemote } from '@tonconnect/sdk';
import type { WalletInfo } from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { action } from 'src/app/state/modals-state';
import { FourWalletsItem, QRCode, WalletLabeledItem } from 'src/app/components';
import { isInTMA } from 'src/app/utils/tma-api';
import {
    redirectToTelegram,
    redirectToWallet,
    enrichUniversalLink,
    buildWalletIntentLink
} from 'src/app/utils/url-strategy-helpers';
import { WalletsContainerStyled } from 'src/app/views/modals/wallets-modal/desktop-universal-modal/style';
import { widgetController } from 'src/app/widget-controller';
import { openLinkBlank } from 'src/app/utils/web-api';
import type { UIWalletInfo } from 'src/app/models/ui-wallet-info';

interface IntentWalletsSectionProps {
    intentUrl: string | undefined;
    tonConnectUI: { getWallets: () => Promise<WalletInfo[]> } | null | undefined;
}

const IntentWalletsSection: Component<IntentWalletsSectionProps> = props => {
    const [walletsResource] = createResource(
        () => (props.tonConnectUI ? props.tonConnectUI.getWallets() : undefined),
        { initialValue: [] as WalletInfo[] }
    );

    const intentWallets = (): UIWalletInfo[] =>
        (walletsResource() ?? [])
            .filter(isWalletInfoRemote)
            .map(w => ({ ...w, isSupportRequiredFeatures: true })) as UIWalletInfo[];

    const visibleWallets = createMemo(() => intentWallets().slice(0, 3));
    const fourWalletsItem = createMemo(() =>
        intentWallets()
            .filter(wallet => !visibleWallets().find(w => w.appName === wallet.appName))
            .slice(0, 4)
    );

    const onOpenWallet = (wallet: UIWalletInfo, url: string): void => {
        if (!url) {
            return;
        }
        const link = buildWalletIntentLink(wallet as { universalLink?: string }, url);
        openLinkBlank(link);
    };

    const onOpenAllWallets = (): void => {
        widgetController.openWalletsModal({ initialTab: 'all-wallets' });
    };

    return (
        <Show when={intentWallets().length > 0}>
            <IntentWalletsH2Styled translationKey="walletModal.desktopUniversalModal.availableWallets">
                Available wallets
            </IntentWalletsH2Styled>
            <WalletsContainerStyled>
                <For each={visibleWallets()}>
                    {wallet => (
                        <li>
                            <WalletLabeledItem
                                wallet={wallet}
                                onClick={() => onOpenWallet(wallet, props.intentUrl!)}
                            />
                        </li>
                    )}
                </For>
                <Show when={fourWalletsItem().length > 0}>
                    <li>
                        <FourWalletsItem
                            labelLine1="View all"
                            labelLine2="wallets"
                            images={fourWalletsItem().map(i => i.imageUrl)}
                            onClick={onOpenAllWallets}
                        />
                    </li>
                </Show>
            </WalletsContainerStyled>
        </Show>
    );
};

function getWalletLinks(
    tonConnectUI:
        | {
              wallet?: {
                  universalLink?: string;
                  deepLink?: string;
                  openMethod?: string;
              } | null;
          }
        | null
        | undefined
): {
    universalLink: string | undefined;
    deepLink: string | undefined;
} {
    let universalLink: string | undefined;
    let deepLink: string | undefined;
    if (
        tonConnectUI?.wallet &&
        'universalLink' in tonConnectUI.wallet &&
        (tonConnectUI.wallet.openMethod === 'universal-link' ||
            (isTelegramUrl(tonConnectUI.wallet.universalLink) && isInTMA()))
    ) {
        universalLink = tonConnectUI.wallet.universalLink;
    }
    if (
        tonConnectUI?.wallet &&
        'deepLink' in tonConnectUI.wallet &&
        (tonConnectUI.wallet.openMethod === 'custom-deeplink' ||
            (isTelegramUrl(tonConnectUI.wallet.deepLink) && isInTMA()))
    ) {
        deepLink = tonConnectUI.wallet.deepLink;
    }
    return { universalLink, deepLink };
}

interface ActionModalProps extends WithDataAttributes {
    headerTranslationKey: string;
    headerTranslationValues?: Record<string, string>;
    icon: JSXElement;
    textTranslationKey?: string;
    textTranslationValues?: Record<string, string>;
    onClose: () => void;
    showButton?: 'close' | 'open-wallet';
}

export const ActionModal: Component<ActionModalProps> = props => {
    const dataAttrs = useDataAttributes(props);
    const tonConnectUI = useContext(TonConnectUiContext);
    const walletLinks = createMemo(() =>
        getWalletLinks(tonConnectUI as Parameters<typeof getWalletLinks>[0])
    );
    const universalLink = (): string | undefined => walletLinks().universalLink;
    const deepLink = (): string | undefined => walletLinks().deepLink;
    const [firstClick, setFirstClick] = createSignal(true);
    const [sent, setSent] = createSignal(false);
    const [signed, setSigned] = createSignal(false);
    const [canceled, setCanceled] = createSignal(false);
    const [intentUrl, setIntentUrl] = createSignal<string | undefined>();

    createEffect(() => {
        const currentAction = action();

        setSent(
            !!currentAction &&
                (('sent' in currentAction && currentAction.sent) ||
                    currentAction.name === 'transaction-sent')
        );
        setSigned(
            !!currentAction &&
                (('signed' in currentAction && currentAction.signed) ||
                    currentAction.name === 'data-signed')
        );
        setCanceled(
            !!currentAction &&
                (currentAction.name === 'transaction-canceled' ||
                    currentAction.name === 'sign-data-canceled')
        );
        setIntentUrl(currentAction?.intentUrl);
    });

    const onOpenWallet = (): void => {
        const currentAction = action()!;
        const returnStrategy =
            'returnStrategy' in currentAction
                ? currentAction.returnStrategy
                : appState.returnStrategy;

        const forceRedirect = !firstClick();
        setFirstClick(false);

        // Add session ID to universal link if provided
        const linkWithSessionId = enrichUniversalLink(universalLink()!, {
            sessionId: currentAction.sessionId,
            traceId: currentAction.traceId
        });

        if (isTelegramUrl(universalLink())) {
            redirectToTelegram(linkWithSessionId, {
                returnStrategy: returnStrategy,
                twaReturnUrl:
                    'twaReturnUrl' in currentAction
                        ? currentAction.twaReturnUrl
                        : appState.twaReturnUrl,
                forceRedirect: forceRedirect
            });
        } else {
            redirectToWallet(
                linkWithSessionId,
                deepLink(),
                {
                    returnStrategy: returnStrategy,
                    forceRedirect: forceRedirect
                },
                () => {}
            );
        }
    };

    return (
        <ActionModalStyled {...dataAttrs}>
            <Show when={!intentUrl()} fallback={<QRCode sourceUrl={intentUrl()!} />}>
                {props.icon}
            </Show>
            <Show when={intentUrl()}>
                <IntentScanH2Styled translationKey="walletModal.desktopUniversalModal.scan">
                    Scan with your mobile wallet
                </IntentScanH2Styled>
            </Show>
            <H1Styled
                translationKey={props.headerTranslationKey}
                translationValues={props.headerTranslationValues}
            />
            <TextStyled
                translationKey={props.textTranslationKey}
                translationValues={props.textTranslationValues}
            />
            <IntentWalletsSection
                intentUrl={intentUrl()}
                tonConnectUI={tonConnectUI ?? undefined}
            />
            <Show
                when={
                    !sent() &&
                    !signed() &&
                    !canceled() &&
                    !intentUrl() &&
                    ((props.showButton === 'open-wallet' && universalLink()) ||
                        props.showButton !== 'open-wallet')
                }
            >
                <LoaderButtonStyled disabled={true} data-tc-connect-button-loading="true">
                    <LoaderIconStyled />
                </LoaderButtonStyled>
            </Show>
            <Show when={sent() || signed()}>
                <Show when={props.showButton !== 'open-wallet'}>
                    <ButtonStyled onClick={() => props.onClose()}>
                        <Translation translationKey="common.close">Close</Translation>
                    </ButtonStyled>
                </Show>
                <Show when={props.showButton === 'open-wallet' && universalLink()}>
                    <ButtonStyled onClick={onOpenWallet}>
                        <Translation translationKey="common.openWallet">Open wallet</Translation>
                    </ButtonStyled>
                </Show>
            </Show>
        </ActionModalStyled>
    );
};

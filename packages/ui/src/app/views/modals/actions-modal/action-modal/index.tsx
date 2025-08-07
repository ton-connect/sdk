import { Component, createEffect, createSignal, JSXElement, Show, useContext } from 'solid-js';
import { Translation } from 'src/app/components/typography/Translation';
import {
    ActionModalStyled,
    ButtonStyled,
    H1Styled,
    LoaderButtonStyled,
    LoaderIconStyled,
    TextStyled
} from './style';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { isTelegramUrl } from '@tonconnect/sdk';
import { appState } from 'src/app/state/app.state';
import { action } from 'src/app/state/modals-state';
import { isInTMA } from 'src/app/utils/tma-api';
import {
    redirectToTelegram,
    redirectToWallet,
    addSessionIdToUniversalLink
} from 'src/app/utils/url-strategy-helpers';

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
    const [firstClick, setFirstClick] = createSignal(true);
    const [sent, setSent] = createSignal(false);
    const [signed, setSigned] = createSignal(false);
    const [canceled, setCanceled] = createSignal(false);

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
    });

    let universalLink: string | undefined;
    if (
        tonConnectUI?.wallet &&
        'universalLink' in tonConnectUI.wallet &&
        (tonConnectUI.wallet.openMethod === 'universal-link' ||
            (isTelegramUrl(tonConnectUI.wallet.universalLink) && isInTMA()))
    ) {
        universalLink = tonConnectUI.wallet.universalLink;
    }

    let deepLink: string | undefined;
    if (
        tonConnectUI?.wallet &&
        'deepLink' in tonConnectUI.wallet &&
        (tonConnectUI.wallet.openMethod === 'custom-deeplink' ||
            (isTelegramUrl(tonConnectUI.wallet.deepLink) && isInTMA()))
    ) {
        deepLink = tonConnectUI.wallet.deepLink;
    }

    const onOpenWallet = (): void => {
        const currentAction = action()!;
        const returnStrategy =
            'returnStrategy' in currentAction
                ? currentAction.returnStrategy
                : appState.returnStrategy;

        const forceRedirect = !firstClick();
        setFirstClick(false);

        // Add session ID to universal link if provided
        const linkWithSessionId = currentAction.sessionId
            ? addSessionIdToUniversalLink(universalLink!, currentAction.sessionId)
            : universalLink!;

        if (isTelegramUrl(universalLink)) {
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
                deepLink,
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
            {props.icon}
            <H1Styled
                translationKey={props.headerTranslationKey}
                translationValues={props.headerTranslationValues}
            />
            <TextStyled
                translationKey={props.textTranslationKey}
                translationValues={props.textTranslationValues}
            />
            <Show
                when={
                    !sent() &&
                    !signed() &&
                    !canceled() &&
                    ((props.showButton === 'open-wallet' && universalLink) ||
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
                <Show when={props.showButton === 'open-wallet' && universalLink}>
                    <ButtonStyled onClick={onOpenWallet}>
                        <Translation translationKey="common.openWallet">Open wallet</Translation>
                    </ButtonStyled>
                </Show>
            </Show>
        </ActionModalStyled>
    );
};

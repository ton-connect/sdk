import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import {
    AtWalletIcon,
    CopyLightIcon,
    DoneIcon,
    FourWalletsItem,
    LongArrowIcon,
    QRIcon,
    Text,
    WalletItem
} from 'src/app/components';
import {
    Divider,
    H1Styled,
    H2Styled,
    IconContainer,
    OtherOptionButton,
    StyledLeftActionButton,
    TelegramButtonStyled,
    TGImageStyled,
    UlStyled
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

interface MobileUniversalModalProps {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;

    onSelect: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const MobileUniversalModal: Component<MobileUniversalModalProps> = props => {
    const [showQR, setShowQR] = createSignal(false);
    const [firstClick, setFirstClick] = createSignal(true);
    const [universalLink, setUniversalLink] = createSignal<string | null>(null);
    const connector = appState.connector;
    const walletsList = (): WalletInfo[] =>
        props.walletsList.filter(w => supportsMobile(w) && w.appName !== AT_WALLET_APP_NAME);
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

    const onSelectTelegram = (): void => {
        setUniversalLink(null);

        const atWallet = props.walletsList.find(wallet => wallet.appName === AT_WALLET_APP_NAME);
        if (!atWallet || !isWalletInfoRemote(atWallet)) {
            throw new TonConnectUIError('@wallet bot not found in the wallets list');
        }

        const walletLink = connector.connect(
            {
                bridgeUrl: atWallet.bridgeUrl,
                universalLink: atWallet.universalLink
            },
            props.additionalRequest
        );

        const forceRedirect = !firstClick();
        setFirstClick(false);

        redirectToTelegram(walletLink, {
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

    return (
        <div data-tc-wallets-modal-universal-mobile="true">
            <Show when={showQR()}>
                <StyledLeftActionButton icon="arrow" onClick={onCloseQR} />
                <MobileUniversalQR universalLink={getUniversalLink()} />
            </Show>
            <Show when={!showQR()}>
                <StyledLeftActionButton icon={<QRIcon />} onClick={onOpenQR} />
                <H1Styled translationKey="walletModal.mobileUniversalModal.connectYourWallet">
                    Connect your wallet
                </H1Styled>
                <H2Styled
                    translationKey="walletModal.mobileUniversalModal.openWalletOnTelegramOrSelect"
                    maxWidth={342}
                >
                    Open Wallet in Telegram or select your wallet to connect
                </H2Styled>
                <TelegramButtonStyled
                    leftIcon={<AtWalletIcon />}
                    rightIcon={<TGImageStyled src={IMG.TG} />}
                    onClick={onSelectTelegram}
                    scale="s"
                >
                    <Translation translationKey="walletModal.mobileUniversalModal.openWalletOnTelegram">
                        Open Wallet in Telegram
                    </Translation>
                </TelegramButtonStyled>
                <UlStyled>
                    <For each={shouldShowMoreButton() ? walletsList().slice(0, 4) : walletsList()}>
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
                    <Divider>&nbsp;</Divider>
                    <OtherOptionButton onClick={onSelectUniversal}>
                        <IconContainer>
                            <LongArrowIcon />
                        </IconContainer>
                        <Text
                            fontWeight={590}
                            translationKey="walletModal.mobileUniversalModal.openLink"
                        >
                            Open Link
                        </Text>
                    </OtherOptionButton>
                    <OtherOptionButton onClick={onCopy}>
                        <IconContainer>
                            {isCopiedShown() !== undefined ? <DoneIcon /> : <CopyLightIcon />}
                        </IconContainer>
                        <Text
                            fontWeight={590}
                            translationKey={
                                isCopiedShown() !== undefined ? 'common.copied' : 'common.copyLink'
                            }
                        >
                            {isCopiedShown() !== undefined ? 'Copied' : 'Copy Link'}
                        </Text>
                    </OtherOptionButton>
                </UlStyled>
            </Show>
        </div>
    );
};

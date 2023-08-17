import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
import { Component, createMemo, createSignal, For, Show } from 'solid-js';
import {
    LongArrowIcon,
    WalletItem,
    Text,
    AtWalletIcon,
    DoneIcon,
    CopyLightIcon,
    FourWalletsItem
} from 'src/app/components';
import {
    Divider,
    H1Styled,
    H2Styled,
    IconContainer,
    OtherOptionButton,
    TelegramButtonStyled,
    TGImageStyled,
    UlStyled
} from './style';
import { addReturnStrategy, openLinkBlank } from 'src/app/utils/web-api';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { IMG } from 'src/app/env/IMG';
import { supportsMobile } from 'src/app/utils/wallets';
import { AT_WALLET_NAME } from 'src/app/env/AT_WALLET_NAME';
import { copyToClipboard } from 'src/app/utils/copy-to-clipboard';
import { TonConnectUIError } from 'src/errors';

interface MobileUniversalModalProps {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;

    onSelect: (walletInfo: WalletInfo) => void;

    onSelectAllWallets: () => void;
}

export const MobileUniversalModal: Component<MobileUniversalModalProps> = props => {
    const connector = appState.connector;
    const walletsList = (): WalletInfo[] =>
        props.walletsList.filter(w => supportsMobile(w) && w.name !== AT_WALLET_NAME);
    const shouldShowMoreButton = (): boolean => walletsList().length > 7;

    const universalLink = createMemo(() =>
        connector.connect(
            props.walletsList
                .filter(isWalletInfoRemote)
                .map(item => ({ bridgeUrl: item.bridgeUrl, universalLink: item.universalLink })),
            props.additionalRequest
        )
    );

    setLastSelectedWalletInfo({ openMethod: 'universal-link' });

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

    const onSelectUniversal = (): void => {
        openLinkBlank(addReturnStrategy(universalLink(), appState.returnStrategy));
    };

    const onSelectTelegram = (): void => {
        const atWallet = props.walletsList.find(wallet => wallet.name === AT_WALLET_NAME);
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
        openLinkBlank(walletLink);
    };

    return (
        <div data-tc-wallets-modal-mobile="true">
            <H1Styled translationKey="walletModal.mobileSelectWalletModal.connectWallet">
                Connect your wallet
            </H1Styled>
            <H2Styled translationKey="walletModal.mobileSelectWalletModal.selectWallet">
                Open Wallet on Telegram or select your wallet to connect
            </H2Styled>
            <TelegramButtonStyled
                leftIcon={<AtWalletIcon />}
                rightIcon={<TGImageStyled src={IMG.TG} />}
                onClick={onSelectTelegram}
                scale="s"
            >
                Open Wallet on Telegram
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
                        translationKey="walletModal.mobileSelectWalletModal.openLink"
                    >
                        OpenLink
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
        </div>
    );
};

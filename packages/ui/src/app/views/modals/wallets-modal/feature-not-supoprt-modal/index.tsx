import { Component, createMemo, createSignal, For, Match, Show, Switch } from 'solid-js';
import {
    DesktopFeatureNotSupportModalStyled,
    TitleStyled,
    DescriptionStyled,
    WalletsContainerStyled,
    ErrorIconStyled,
    DisconnectButtonStyled,
    RestoreWalletLinkStyled,
    StyledIconButton,
    BodyTextStyled,
    Spacer,
    ButtonsContainerStyled,
    H1Styled
} from './style';

import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { FourWalletsItem, WalletLabeledItem, Button, Link, LinkIcon } from 'src/app/components';
import { checkRequiredWalletFeatures, Wallet } from '@tonconnect/sdk';
import { RestoreInfoModal } from './restore-info-modal';
import { ChooseSupportedFeatureWalletsModal } from 'src/models/wallets-modal';
import { Translation } from 'src/app/components/typography/Translation';

interface DesktopFeatureNotSupportModalProps {
    walletsList: UIWalletInfo[];
    currentWallet: Wallet;
    walletsModalState: ChooseSupportedFeatureWalletsModal;
    onSelect: (walletInfo: UIWalletInfo) => void;
    onSelectAllWallets: () => void;
    onDisconnect: () => Promise<void>;
    onClose: () => void;
}

export const DesktopFeatureNotSupportModal: Component<
    DesktopFeatureNotSupportModalProps
> = props => {
    const [selectedWallet, setSelectedWallet] = createSignal<UIWalletInfo | null>(null);
    const [infoModalOpen, setInfoModalOpen] = createSignal(false);

    const supportedWallets = createMemo(() => {
        const requiredFeature = props.walletsModalState.requiredFeature;
        const requiredFeatures = requiredFeature
            ? { [requiredFeature.featureName]: requiredFeature.value }
            : {};

        return props.walletsList.filter(
            wallet =>
                wallet.isSupportRequiredFeatures &&
                wallet.features &&
                checkRequiredWalletFeatures(wallet.features, requiredFeatures)
        );
    });

    const currentWalletUI = createMemo(() =>
        props.walletsList.find(wallet => wallet.name === props.currentWallet.device.appName)
    );

    const currentWalletVersionNotSupported = createMemo(() => {
        const currentWalletUIVar = currentWalletUI();
        console.log('currentWalletUI', currentWalletUIVar);
        if (!currentWalletUIVar?.features) {
            return false;
        }

        const featureNameKeyMap = {
            SendTransaction: 'sendTransaction',
            SignData: 'signData'
        };

        const requiredFeature = props.walletsModalState.requiredFeature;
        const requiredFeatures = requiredFeature
            ? { [featureNameKeyMap[requiredFeature.featureName]]: requiredFeature.value } // TODO: fix unreadable code
            : {};

        const validInList = checkRequiredWalletFeatures(
            currentWalletUIVar.features,
            requiredFeatures
        );

        const validCurrentWallet = checkRequiredWalletFeatures(
            props.currentWallet.device.features,
            requiredFeatures
        );

        console.log(
            'currentWalletVersionNotSupported',
            validInList,
            validCurrentWallet,
            currentWalletUIVar.features,
            requiredFeatures,
            props.currentWallet
        );

        return validInList && !validCurrentWallet;
    });

    const visibleWallets = createMemo(() => supportedWallets().slice(0, 3), null);

    const fourWalletsItem = createMemo(
        () =>
            supportedWallets()
                .filter(wallet => !visibleWallets().find(w => w.appName === wallet.appName))
                .slice(0, 4),
        null
    );

    const handleSelect = (wallet: UIWalletInfo): void => {
        setSelectedWallet(wallet);
    };

    const handleDisconnect = async (): Promise<void> => {
        await props.onDisconnect();
        props.onSelect(selectedWallet()!);
    };

    return (
        <DesktopFeatureNotSupportModalStyled>
            <Switch>
                <Match when={infoModalOpen()}>
                    <RestoreInfoModal onBackClick={() => setInfoModalOpen(false)} />
                </Match>
                <Match when={selectedWallet()}>
                    <Spacer />
                    <DesktopFeatureNotSupportModalStyled>
                        <StyledIconButton icon="arrow" onClick={() => setSelectedWallet(null)} />
                        <TitleStyled translationKey="walletModal.featureNotSupported.disconnect.title">
                            Confirm Disconnect
                        </TitleStyled>

                        <DescriptionStyled
                            translationKey="walletModal.featureNotSupported.disconnect.description"
                            translationValues={{ name: selectedWallet()!.name }}
                        >
                            You will be disconnected from your current wallet and redirected to
                            connect {selectedWallet()?.name}.
                        </DescriptionStyled>

                        <DisconnectButtonStyled onClick={() => handleDisconnect()}>
                            <Translation translationKey="walletModal.featureNotSupported.disconnect.button">
                                Disconnect
                            </Translation>
                        </DisconnectButtonStyled>
                    </DesktopFeatureNotSupportModalStyled>
                </Match>
                <Match when={currentWalletVersionNotSupported()}>
                    <H1Styled>{props.currentWallet.device.appName}</H1Styled>
                    <ErrorIconStyled size="s" />
                    <BodyTextStyled
                        translationKey="walletModal.featureNotSupported.version.description"
                        translationValues={{ name: props.currentWallet.device.appName }}
                    >
                        Your current version of {props.currentWallet.device.appName} or wallet
                        contract type doesn't support the required features. Please update it to
                        continue.
                    </BodyTextStyled>

                    <ButtonsContainerStyled>
                        <Link href={currentWalletUI()!.aboutUrl} blank>
                            <Button leftIcon={<LinkIcon />}>
                                <Translation
                                    translationKey="walletModal.featureNotSupported.version.updateButton"
                                    translationValues={{ name: currentWalletUI()!.name }}
                                >
                                    Update {currentWalletUI()!.name}
                                </Translation>
                            </Button>
                        </Link>
                        <Link href="https://tonkeeper.helpscoutdocs.com/article/102-w5" blank>
                            <Button leftIcon={<LinkIcon />}>
                                <Translation translationKey="walletModal.featureNotSupported.version.aboutW5">
                                    About W5
                                </Translation>
                            </Button>
                        </Link>
                    </ButtonsContainerStyled>
                </Match>
                <Match when={true}>
                    <Spacer />

                    <ErrorIconStyled size="s" />

                    <TitleStyled
                        translationKey="walletModal.featureNotSupported.wallet.title"
                        translationValues={{ name: props.currentWallet.device.appName }}
                    >
                        {props.currentWallet.device.appName} doesn’t support the
                        requested&nbsp;action
                    </TitleStyled>

                    <DescriptionStyled>
                        <Translation translationKey="walletModal.featureNotSupported.wallet.description">
                            Install a supported wallet from the list below, restore it with your
                            recovery phrase, then connect it and try again.
                        </Translation>
                        &nbsp;
                        <RestoreWalletLinkStyled onClick={() => setInfoModalOpen(true)}>
                            <Translation translationKey="walletModal.featureNotSupported.wallet.info">
                                Learn how to restore your wallet
                            </Translation>
                        </RestoreWalletLinkStyled>
                    </DescriptionStyled>

                    <WalletsContainerStyled>
                        <For each={visibleWallets()}>
                            {wallet => (
                                <li>
                                    <WalletLabeledItem
                                        wallet={wallet}
                                        onClick={() => handleSelect(wallet)}
                                    />
                                </li>
                            )}
                        </For>
                        <Show when={fourWalletsItem().length > 0}>
                            <FourWalletsItem
                                labelLine1="View all"
                                labelLine2="wallets"
                                images={fourWalletsItem().map(i => i.imageUrl)}
                                onClick={() => props.onSelectAllWallets()}
                            />
                        </Show>
                    </WalletsContainerStyled>
                </Match>
            </Switch>
        </DesktopFeatureNotSupportModalStyled>
    );
};

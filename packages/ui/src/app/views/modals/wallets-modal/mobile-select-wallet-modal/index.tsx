import { ConnectAdditionalRequest, WalletInfo, WalletInfoRemote } from '@tonconnect/sdk';
import { Component, For } from 'solid-js';
import { H1, LongArrowIcon, WalletItem, Text } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import {
    ButtonStyled,
    DefaultWallet,
    Divider,
    H2Styled,
    LongArrowIconContainer,
    UlStyled
} from './style';
import { addReturnStrategy, openLink, openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';
import { LINKS } from 'src/app/env/LINKS';

interface MobileSelectWalletModalProps extends Identifiable {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;
}

export const MobileSelectWalletModal: Component<MobileSelectWalletModalProps> = props => {
    const connector = appState.connector;

    const onSelect = (walletInfo: WalletInfo): void => {
        if ('universalLink' in walletInfo) {
            setLastSelectedWalletInfo({ ...walletInfo, openMethod: 'universal-link' });

            const universalLink = connector.connect(
                {
                    universalLink: walletInfo.universalLink,
                    bridgeUrl: walletInfo.bridgeUrl
                },
                props.additionalRequest
            );

            openLink(addReturnStrategy(universalLink, appState.returnStrategy));
        }

        openLinkBlank(walletInfo.aboutUrl);
    };

    const onSelectUniversal = (): void => {
        const universalLink = connector.connect(
            props.walletsList
                .filter(wallet => 'bridgeUrl' in wallet)
                .map(wallet => (wallet as WalletInfoRemote).bridgeUrl)
        ) as string;

        openLink(addReturnStrategy(universalLink, appState.returnStrategy));
    };

    return (
        <div id={props.id}>
            <H1 translationKey="walletModal.mobileSelectWalletModal.connectWallet">
                Connect a wallet
            </H1>
            <H2Styled translationKey="walletModal.mobileSelectWalletModal.selectWallet">
                Select your wallet from the options to get started.
            </H2Styled>
            <UlStyled>
                <DefaultWallet onClick={onSelectUniversal}>
                    <LongArrowIconContainer>
                        <LongArrowIcon />
                    </LongArrowIconContainer>
                    <Text
                        fontWeight={590}
                        translationKey="walletModal.mobileSelectWalletModal.installedWallet"
                    >
                        Installed wallet
                    </Text>
                </DefaultWallet>
                <Divider>&nbsp;</Divider>
                <For each={props.walletsList.filter(wallet => 'bridgeUrl' in wallet)}>
                    {wallet => (
                        <li>
                            <WalletItem
                                iconUrl={wallet.imageUrl}
                                name={wallet.name}
                                onClick={() => onSelect(wallet)}
                            />
                        </li>
                    )}
                </For>
            </UlStyled>
            <ButtonStyled onClick={() => openLinkBlank(LINKS.LEARN_MORE)}>
                <Translation translationKey="common.learnMore">Learn more</Translation>
            </ButtonStyled>
        </div>
    );
};

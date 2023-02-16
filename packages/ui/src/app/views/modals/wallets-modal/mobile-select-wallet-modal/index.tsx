import { ConnectAdditionalRequest, isWalletInfoRemote, WalletInfo } from '@tonconnect/sdk';
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
import { Link } from 'src/app/components/link';
import {useTheme} from "solid-styled-components";

interface MobileSelectWalletModalProps extends Identifiable {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;
}

export const MobileSelectWalletModal: Component<MobileSelectWalletModalProps> = props => {
    const connector = appState.connector;
    const theme = useTheme();

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
            return;
        }

        openLinkBlank(walletInfo.aboutUrl);
    };

    const onSelectUniversal = (): void => {
        const universalLink = connector.connect(
            props.walletsList
                .filter(isWalletInfoRemote)
                .map(item => ({ bridgeUrl: item.bridgeUrl, universalLink: item.universalLink })),
            props.additionalRequest
        );
        function blurHandler(): void {
            setLastSelectedWalletInfo({ openMethod: 'universal-link' });
            window.removeEventListener('blur', blurHandler);
        }

        window.addEventListener('blur', blurHandler);

        openLink(addReturnStrategy(universalLink, appState.returnStrategy));
        setTimeout(() => {
            window.removeEventListener('blur', blurHandler);
        }, 200);
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
                        <LongArrowIcon fill={theme!.colors.accent} />
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
            <Link href={LINKS.LEARN_MORE} blank>
                <ButtonStyled>
                    <Translation translationKey="common.exploreWallets">Explore TON wallets</Translation>
                </ButtonStyled>
            </Link>
        </div>
    );
};

import { ConnectAdditionalRequest, WalletInfo } from '@tonconnect/sdk';
import { Component, For } from 'solid-js';
import { H1 } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import { WalletItem } from './wallet-item';
import { ButtonStyled, H2Styled, UlStyled } from './style';
import { addReturnStrategy, openLink, openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';
import { setLastSelectedWalletInfo } from 'src/app/state/modals-state';
import { appState } from 'src/app/state/app.state';

interface MobileSelectWalletModalProps extends Identifiable {
    walletsList: WalletInfo[];

    additionalRequest: ConnectAdditionalRequest;
}

export const MobileSelectWalletModal: Component<MobileSelectWalletModalProps> = props => {
    const learnMoreUrl = 'https://ton.org/wallets';
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

    return (
        <div id={props.id}>
            <H1 translationKey="walletModal.selectWalletModal.connectWallet">Connect a wallet</H1>
            <H2Styled translationKey="walletModal.selectWalletModal.selectWallet">
                Select your wallet from the options to get started.
            </H2Styled>
            <UlStyled>
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
            <ButtonStyled onClick={() => openLinkBlank(learnMoreUrl)}>
                <Translation translationKey="walletModal.selectWalletModal.learnMore">
                    Learn more
                </Translation>
            </ButtonStyled>
        </div>
    );
};

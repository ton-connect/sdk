import { WalletInfo } from '@tonconnect/sdk';
import { Component, For } from 'solid-js';
import { H1 } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import { WalletItem } from './wallet-item';
import { ButtonStyled, H2Styled, SelectWalletModalStyled, UlStyled } from './style';
import { openLinkBlank } from 'src/app/utils/web-api';
import { Identifiable } from 'src/app/models/identifiable';

interface SelectWalletModalProps extends Identifiable {
    walletsList: WalletInfo[];
    onSelect: (wallet: WalletInfo) => void;
}

export const SelectWalletModal: Component<SelectWalletModalProps> = props => {
    const learnMoreUrl = 'https://ton.org/wallets';

    return (
        <SelectWalletModalStyled id={props.id}>
            <H1 translationKey="walletModal.selectWalletModal.connectWallet">Connect a wallet</H1>
            <H2Styled translationKey="walletModal.selectWalletModal.selectWallet">
                Select your wallet from the options to get started.
            </H2Styled>
            <UlStyled>
                <For each={props.walletsList}>
                    {wallet => (
                        <li>
                            <WalletItem
                                iconUrl={wallet.imageUrl}
                                name={wallet.name}
                                onClick={() => props.onSelect(wallet)}
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
        </SelectWalletModalStyled>
    );
};

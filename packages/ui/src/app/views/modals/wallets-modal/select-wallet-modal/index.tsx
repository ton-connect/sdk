import { WalletInfo } from '@tonconnect/sdk';
import { Component, createResource, For, Show, useContext } from 'solid-js';
import { H1 } from 'src/app/components';
import { Translation } from 'src/app/components/typography/Translation';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { WalletItem } from './wallet-item';
import { ButtonStyled, H2Styled, SelectWalletModalStyled, UlStyled } from './style';

interface SelectWalletModalProps {
    onSelect: (wallet: WalletInfo) => void;
}

export const SelectWalletModal: Component<SelectWalletModalProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [walletsList] = createResource(() => tonConnectUI!.getWallets());

    return (
        <SelectWalletModalStyled>
            <H1 translationKey="walletModal.selectWalletModal.connectWallet">Connect a wallet</H1>
            <H2Styled translationKey="walletModal.selectWalletModal.selectWallet">
                Select your wallet from the options to get started.
            </H2Styled>
            <Show when={walletsList.state === 'ready'}>
                <UlStyled>
                    <For each={walletsList()}>
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
                <ButtonStyled appearance="secondary" onClick={() => {}}>
                    <Translation translationKey="walletModal.selectWalletModal.learnMore">
                        Learn more
                    </Translation>
                </ButtonStyled>
            </Show>
        </SelectWalletModalStyled>
    );
};

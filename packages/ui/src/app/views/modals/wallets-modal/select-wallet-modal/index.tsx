import { WalletInfo } from '@tonconnect/sdk';
import { Component, createResource, For, Show, useContext } from 'solid-js';
import { H1, H2 } from 'src/app/components';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { WalletItem } from 'src/app/views/modals/wallets-modal/select-wallet-modal/wallet-item';
import { ButtonStyled, SelectWalletModalStyled, UlStyled } from './style';

interface SelectWalletModalProps {
    onSelect: (wallet: WalletInfo) => void;
}

export const SelectWalletModal: Component<SelectWalletModalProps> = props => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [walletsList] = createResource(() => tonConnectUI.getWallets());

    return (
        <SelectWalletModalStyled>
            <H1>Connect a wallet</H1>
            <H2>Select your wallet from the options to get started.</H2>
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
                    Learn more
                </ButtonStyled>
            </Show>
        </SelectWalletModalStyled>
    );
};

import { Component, For } from 'solid-js';
import { H1, H2 } from 'src/app/components';
import { WalletItem } from 'src/app/views/modals/wallets-modal/select-wallet-modal/wallet-item';
import { ButtonStyled, SelectWalletModalStyled, UlStyled } from './style';
// import * as walletsList from 'src/app/constants/wallets-list.json';

interface SelectWalletModalProps {}

const walletsList = [
    {
        iconUrl: '/icon.png',
        name: 'TonKeeper'
    },
    {
        iconUrl: '/icon.png',
        name: 'Ton HOLD wallet free version'
    },
    {
        iconUrl: '/icon.png',
        name: 'TonKeeper'
    },
    {
        iconUrl: '/icon.png',
        name: 'Ton HOLD wallet free version'
    },
    {
        iconUrl: '/icon.png',
        name: 'TonKeeper'
    },
    {
        iconUrl: '/icon.png',
        name: 'Ton HOLD wallet free version'
    },
    {
        iconUrl: '/icon.png',
        name: 'TonKeeper'
    },
    {
        iconUrl: '/icon.png',
        name: 'Ton HOLD wallet free version'
    }
];

export const SelectWalletModal: Component<SelectWalletModalProps> = props => {
    return (
        <SelectWalletModalStyled>
            <H1>Connect a wallet</H1>
            <H2>Select your wallet from the options to get started.</H2>
            <UlStyled>
                <For each={walletsList}>
                    {wallet => (
                        <li>
                            <WalletItem
                                iconUrl={wallet.iconUrl}
                                name={wallet.name}
                                onClick={() => {}}
                            />
                        </li>
                    )}
                </For>
            </UlStyled>
            <ButtonStyled appearance="secondary" onClick={() => {}}>
                Learn more
            </ButtonStyled>
        </SelectWalletModalStyled>
    );
};

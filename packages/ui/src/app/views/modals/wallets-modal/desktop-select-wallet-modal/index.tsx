import { Component, createSignal, For } from 'solid-js';
import {
    DesktopSelectWalletModalStyled,
    WalletsUl,
    H1Styled,
    StyledIconButton,
    WalletLabeledItemStyled,
    ScrollDivider
} from './style';
import { WalletInfo } from '@tonconnect/sdk';
export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onBack: () => void;

    onSelect: (walletInfo: WalletInfo) => void;
}

export const DesktopSelectWalletModal: Component<DesktopSelectWalletModalProps> = props => {
    const [scrolled, setScrolled] = createSignal(false);

    const onScroll = (e: Event): void => {
        setScrolled((e.target as HTMLUListElement).scrollTop !== 0);
    };

    return (
        <DesktopSelectWalletModalStyled data-tc-select-wallet-desktop="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBack()} />
            <H1Styled>Wallets</H1Styled>
            <ScrollDivider isShown={scrolled()} />
            <WalletsUl onScroll={onScroll}>
                <For each={props.walletsList}>
                    {wallet => (
                        <li>
                            <WalletLabeledItemStyled
                                wallet={wallet}
                                onClick={() => props.onSelect(wallet)}
                            />
                        </li>
                    )}
                </For>
            </WalletsUl>
        </DesktopSelectWalletModalStyled>
    );
};

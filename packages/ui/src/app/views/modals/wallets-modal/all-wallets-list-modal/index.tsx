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
import isMobile from 'src/app/hooks/isMobile';
import { supportsMobile } from 'src/app/utils/wallets';
export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onBack: () => void;

    onSelect: (walletInfo: WalletInfo) => void;
}

export const AllWalletsListModal: Component<DesktopSelectWalletModalProps> = props => {
    const [scrolled, setScrolled] = createSignal(false);

    const onScroll = (e: Event): void => {
        setScrolled((e.target as HTMLUListElement).scrollTop !== 0);
    };

    const walletsList = (): WalletInfo[] =>
        isMobile() ? props.walletsList.filter(supportsMobile) : props.walletsList;

    return (
        <DesktopSelectWalletModalStyled data-tc-select-wallet-desktop="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBack()} />
            <H1Styled>Wallets</H1Styled>
            <ScrollDivider isShown={scrolled()} />
            <WalletsUl onScroll={onScroll}>
                <For each={walletsList()}>
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

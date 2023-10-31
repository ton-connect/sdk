import { Component, For } from 'solid-js';
import {
    DesktopSelectWalletModalStyled,
    WalletsUl,
    H1Styled,
    StyledIconButton,
    WalletLabeledItemStyled
} from './style';
import { WalletInfo } from '@tonconnect/sdk';
import { isMobile } from 'src/app/hooks/isMobile';
import { supportsMobile } from 'src/app/utils/wallets';
import { ScrollContainer } from 'src/app/components/scroll-container';
export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onBack: () => void;

    onSelect: (walletInfo: WalletInfo) => void;
}

export const AllWalletsListModal: Component<DesktopSelectWalletModalProps> = props => {
    const maxHeight = (): number | undefined => (isMobile() ? undefined : 510);

    const walletsList = (): WalletInfo[] =>
        isMobile() ? props.walletsList.filter(supportsMobile) : props.walletsList;

    return (
        <DesktopSelectWalletModalStyled data-tc-wallets-modal-list="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBack()} />
            <H1Styled translationKey="walletModal.wallets">Wallets</H1Styled>
            <ScrollContainer maxHeight={maxHeight()}>
                <WalletsUl>
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
            </ScrollContainer>
        </DesktopSelectWalletModalStyled>
    );
};

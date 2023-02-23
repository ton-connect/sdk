import { Component, For } from 'solid-js';
import { DesktopSelectWalletModalStyled, WalletsUl, ButtonStyled, H2Styled } from './style';
import { WalletInfo } from '@tonconnect/sdk';
import { Translation } from 'src/app/components/typography/Translation';
import { LINKS } from 'src/app/env/LINKS';
import { Link } from 'src/app/components/link';

export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onSelect: (walletInfo: WalletInfo) => void;
}

import { WalletItem } from 'src/app/components';

export const DesktopSelectWalletModal: Component<DesktopSelectWalletModalProps> = props => {
    return (
        <DesktopSelectWalletModalStyled>
            <H2Styled translationKey="walletModal.desktopSelectWalletModal.selectWallet">
                Choose your preferred wallet from the options to get started.
            </H2Styled>
            <WalletsUl>
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
            </WalletsUl>
            <Link href={LINKS.LEARN_MORE} blank>
                <ButtonStyled appearance="flat">
                    <Translation translationKey="common.exploreWallets">
                        Explore TON wallets
                    </Translation>
                </ButtonStyled>
            </Link>
        </DesktopSelectWalletModalStyled>
    );
};

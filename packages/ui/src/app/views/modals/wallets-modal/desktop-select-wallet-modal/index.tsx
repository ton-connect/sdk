import { Component, For } from 'solid-js';
import {
    DesktopSelectWalletModalStyled,
    WalletsUl,
    ButtonStyled,
    WalletItemStyled,
    H2Styled
} from './style';
import { WalletInfo } from '@tonconnect/sdk';
import { openLinkBlank } from 'src/app/utils/web-api';
import { Translation } from 'src/app/components/typography/Translation';
import { LINKS } from 'src/app/env/LINKS';

export interface DesktopSelectWalletModalProps {
    walletsList: WalletInfo[];

    onSelect: (walletInfo: WalletInfo) => void;
}

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
                            <WalletItemStyled
                                iconUrl={wallet.imageUrl}
                                name={wallet.name}
                                onClick={() => props.onSelect(wallet)}
                            />
                        </li>
                    )}
                </For>
            </WalletsUl>
            <ButtonStyled onClick={() => openLinkBlank(LINKS.LEARN_MORE)}>
                <Translation translationKey="common.learnMore">Learn more</Translation>
            </ButtonStyled>
        </DesktopSelectWalletModalStyled>
    );
};

import { Component, For } from 'solid-js';
import { useI18n } from '@solid-primitives/i18n';
import { WalletItem } from './index';
import { FourWalletsCard, FourWalletsImage } from './four-wallets.style';

interface FourWallets {
    images: string[];
    onClick: () => void;
}

/** The tile that opens the full wallets list, labelled "View all wallets" in the modal's language. */
export const FourWalletsItem: Component<FourWallets> = props => {
    const [t] = useI18n();

    return (
        <WalletItem
            name={t('walletItem.viewAllLine1', {}, 'View all')}
            secondLine={t('walletItem.viewAllLine2', {}, 'wallets')}
            icon={
                <FourWalletsCard>
                    <For each={[0, 1, 2, 3]}>
                        {index => <FourWalletsImage src={props.images[index]!} />}
                    </For>
                </FourWalletsCard>
            }
            onClick={() => props.onClick()}
        />
    );
};

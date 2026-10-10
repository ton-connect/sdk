import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { GRAM_WALLET_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';
import { WalletItem } from 'src/app/components';
import { isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';
import { useI18n } from '@solid-primitives/i18n';

export interface WalletLabeledItemProps extends Styleable {
    wallet:
        | UIWalletInfo
        | (Pick<UIWalletInfo, 'appName' | 'name' | 'imageUrl'> & { type: 'wallet-connect' });
    onClick: () => void;
}

function isWalletUi(wallet: WalletLabeledItemProps['wallet']): wallet is UIWalletInfo {
    return !('type' in wallet) || wallet.type !== 'wallet-connect';
}

export const WalletLabeledItem: Component<WalletLabeledItemProps> = props => {
    const [t] = useI18n();

    const walletsSecondLine = (): string | undefined => {
        if ('isPreferred' in props.wallet && props.wallet.isPreferred) {
            return t('walletItem.recent', {}, 'Recent');
        }
        if (props.wallet.appName === GRAM_WALLET_APP_NAME) {
            return t('walletItem.new', {}, 'New');
        }

        if (isWalletUi(props.wallet) && isWalletInfoCurrentlyInjected(props.wallet)) {
            return t('walletItem.installed', {}, 'Installed');
        }

        return undefined;
    };

    return (
        <WalletItem
            icon={props.wallet.imageUrl}
            name={props.wallet.name}
            secondLine={walletsSecondLine()}
            secondLineColorPrimary={false}
            onClick={() => props.onClick()}
            class={props.class}
        />
    );
};

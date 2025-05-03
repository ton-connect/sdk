import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { AT_WALLET_APP_NAME } from 'src/app/env/AT_WALLET_APP_NAME';
import { WalletItem } from 'src/app/components';
import { isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';
import { IMG } from 'src/app/env/IMG';
import { useI18n } from '@solid-primitives/i18n';

export interface WalletLabeledItemProps extends Styleable {
    wallet: UIWalletInfo;
    onClick: () => void;
}

export const WalletLabeledItem: Component<WalletLabeledItemProps> = props => {
    const [t] = useI18n();

    const walletsSecondLine = (): string | undefined => {
        if (props.wallet.appName === AT_WALLET_APP_NAME) {
            return undefined;
        }
        if ('isPreferred' in props.wallet && props.wallet.isPreferred) {
            return t('walletItem.recent', {}, 'Recent');
        }
        if (isWalletInfoCurrentlyInjected(props.wallet)) {
            return t('walletItem.installed', {}, 'Installed');
        }
        if (props.wallet.name === 'Tonkeeper') {
            return t('walletItem.popular', {}, 'Popular');
        }
        return undefined;
    };

    return (
        <>
            {props.wallet.appName === AT_WALLET_APP_NAME ? (
                <WalletItem
                    icon={props.wallet.imageUrl}
                    name={t('walletItem.walletOn', {}, 'Wallet in')}
                    secondLine="Telegram"
                    badgeUrl={IMG.TG}
                    onClick={() => props.onClick()}
                    class={props.class}
                />
            ) : (
                <WalletItem
                    icon={props.wallet.imageUrl}
                    name={props.wallet.name}
                    secondLine={walletsSecondLine()}
                    secondLineColorPrimary={false}
                    onClick={() => props.onClick()}
                    class={props.class}
                />
            )}
        </>
    );
};

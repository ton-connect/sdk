import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
import { WalletItem } from 'src/app/components';
import { isWalletInfoCurrentlyInjected } from '@tonconnect/sdk';
import { useI18n } from '@solid-primitives/i18n';
import { GRAM_WALLET_APP_NAME, TELEGRAM_WALLET_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';

export interface WalletLabeledItemProps extends Styleable {
    wallet:
        | UIWalletInfo
        | (Pick<UIWalletInfo, 'appName' | 'name' | 'imageUrl'> & { type: 'wallet-connect' });
    /** Telegram stands in the same list, so Gram Wallet's icon goes without its glow beside it. */
    besideTelegram?: boolean;
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

        if (isWalletUi(props.wallet) && isWalletInfoCurrentlyInjected(props.wallet)) {
            return t('walletItem.installed', {}, 'Installed');
        }

        return undefined;
    };

    const isGram = (): boolean => props.wallet.appName === GRAM_WALLET_APP_NAME;
    const isTelegram = (): boolean => props.wallet.appName === TELEGRAM_WALLET_APP_NAME;

    return (
        <WalletItem
            icon={props.wallet.imageUrl}
            name={props.wallet.name}
            secondLine={walletsSecondLine()}
            secondLineColorPrimary={false}
            glow={isGram() && !props.besideTelegram}
            shine={isGram() || isTelegram()}
            round={isTelegram()}
            onClick={() => props.onClick()}
            class={props.class}
        />
    );
};

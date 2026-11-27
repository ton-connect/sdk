import { Component, Show, useContext } from 'solid-js';
import { LoaderIcon, WalletStatusIcon } from 'src/app/components';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { TELEGRAM_WALLET_APP_NAME } from 'src/app/env/WALLET_APP_NAMES';

/**
 * Shown while the connected wallet is asked to confirm: the wallet's own icon with a lit segment
 * running round it, or a plain loader when the wallet came without an icon.
 */
export const WaitingWalletIcon: Component = () => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const imageUrl = (): string | undefined => {
        const wallet = tonConnectUI?.wallet;
        return wallet && 'imageUrl' in wallet ? wallet.imageUrl : undefined;
    };
    const isTelegram = (): boolean => {
        const wallet = tonConnectUI?.wallet;
        return !!wallet && 'appName' in wallet && wallet.appName === TELEGRAM_WALLET_APP_NAME;
    };

    return (
        <Show when={imageUrl()} fallback={<LoaderIcon size="m" />}>
            <WalletStatusIcon src={imageUrl()!} status="waiting" round={isTelegram()} />
        </Show>
    );
};

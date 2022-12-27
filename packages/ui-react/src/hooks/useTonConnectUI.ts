import { useContext } from 'react';
import { TonConnectUIContext } from '../components/TonConnectUIProvider';
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';
import { checkProvider } from '../utils/errors';

/**
 * Use it to get access to the `TonConnectUI` instance and UI options updating function.
 */
export function useTonConnectUI(): [TonConnectUI, (options: TonConnectUiOptions) => void] {
    const tonConnectUI = useContext(TonConnectUIContext);
    checkProvider(tonConnectUI);
    const setOptions = (options: TonConnectUiOptions) => void (tonConnectUI!.uiOptions = options);
    return [tonConnectUI!, setOptions];
}

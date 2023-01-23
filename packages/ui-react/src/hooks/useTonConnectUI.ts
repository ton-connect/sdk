import { useContext } from 'react';
import { TonConnectUIContext } from '../components/TonConnectUIProvider';
import { TonConnectUI, TonConnectUiOptions } from '@tonconnect/ui';
import { checkProvider } from '../utils/errors';
import { isServerSide } from '../utils/web';

/**
 * Use it to get access to the `TonConnectUI` instance and UI options updating function.
 */
export function useTonConnectUI(): [TonConnectUI, (options: TonConnectUiOptions) => void] {
    if (isServerSide()) {
        return [null as unknown as TonConnectUI, () => {}];
    }

    const tonConnectUI = useContext(TonConnectUIContext);
    checkProvider(tonConnectUI);
    const setOptions = (options: TonConnectUiOptions) => void (tonConnectUI!.uiOptions = options);
    return [tonConnectUI!, setOptions];
}
